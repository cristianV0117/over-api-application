function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export type DriveKind = "folder" | "file";

export type DriveNode = {
  id: string;
  parentId: string | null;
  kind: DriveKind;
  name: string;
  mimeType: string | null;
  size: number | null;
  createdAt: string;
  updatedAt: string;
  children: DriveNode[];
};

async function parseError(res: Response, fallback: string): Promise<string> {
  const err = await res.json().catch(() => ({}));
  const message = Array.isArray(err.message) ? err.message[0] : err.message;
  return message || fallback;
}

export async function listDriveTree(): Promise<DriveNode[]> {
  const res = await fetch(`${BASE}/files`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(await parseError(res, "Error al cargar archivos"));
  return res.json();
}

export async function createDriveFolder(
  name: string,
  parentId: string | null
): Promise<DriveNode> {
  const res = await fetch(`${BASE}/files/folders`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ name, parentId }),
  });
  if (!res.ok) throw new Error(await parseError(res, "Error al crear la carpeta"));
  return res.json();
}

export async function uploadDriveFile(
  file: File,
  parentId: string | null
): Promise<DriveNode> {
  const form = new FormData();
  form.append("file", file);
  if (parentId) form.append("parentId", parentId);
  const res = await fetch(`${BASE}/files/upload`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: form,
  });
  if (!res.ok) throw new Error(await parseError(res, "Error al subir el archivo"));
  return res.json();
}

export async function renameDriveNode(
  id: string,
  name: string
): Promise<DriveNode> {
  const res = await fetch(`${BASE}/files/${id}`, {
    method: "PATCH",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(await parseError(res, "Error al renombrar"));
  return res.json();
}

export async function deleteDriveNode(id: string): Promise<void> {
  const res = await fetch(`${BASE}/files/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res, "Error al eliminar"));
}

export async function openDriveFile(id: string): Promise<void> {
  const res = await fetch(`${BASE}/files/${id}/download`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res, "No se pudo abrir el archivo"));
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
}

export function findNode(
  nodes: DriveNode[],
  id: string | null
): DriveNode | null {
  if (!id) return null;
  const walk = (list: DriveNode[]): DriveNode | null => {
    for (const node of list) {
      if (node.id === id) return node;
      const nested = walk(node.children);
      if (nested) return nested;
    }
    return null;
  };
  return walk(nodes);
}

export function breadcrumbPath(
  nodes: DriveNode[],
  id: string | null
): DriveNode[] {
  if (!id) return [];
  const path: DriveNode[] = [];
  const walk = (list: DriveNode[]): boolean => {
    for (const node of list) {
      path.push(node);
      if (node.id === id) return true;
      if (walk(node.children)) return true;
      path.pop();
    }
    return false;
  };
  walk(nodes);
  return path;
}

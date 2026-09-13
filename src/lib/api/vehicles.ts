function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export type VehicleType = "moto" | "carro";
export type VehicleDocKind =
  | "soat"
  | "tecnomecanica"
  | "tarjetaPropiedad"
  | "licencia";

export type VehicleFile = {
  fileName: string;
  mimeType: string;
  uploadedAt: string;
};

export type Vehicle = {
  id: string;
  type: VehicleType;
  plate: string;
  brand: string;
  model: string;
  year: number | null;
  color: string;
  notes: string;
  soatExpiresAt: string | null;
  technoExpiresAt: string | null;
  licenseExpiresAt: string | null;
  documents: {
    soat: VehicleFile | null;
    tecnomecanica: VehicleFile | null;
    tarjetaPropiedad: VehicleFile | null;
    licencia: VehicleFile | null;
  };
  createdAt: string;
};

export type VehicleWrite = {
  type: VehicleType;
  plate: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  notes?: string;
  soatExpiresAt?: string | null;
  technoExpiresAt?: string | null;
  licenseExpiresAt?: string | null;
};

async function parseError(res: Response, fallback: string): Promise<string> {
  const err = await res.json().catch(() => ({}));
  const message = Array.isArray(err.message) ? err.message[0] : err.message;
  return message || fallback;
}

export async function listVehicles(): Promise<Vehicle[]> {
  const res = await fetch(`${BASE}/vehicles`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(await parseError(res, "Error al cargar vehículos"));
  return res.json();
}

export async function createVehicle(data: VehicleWrite): Promise<Vehicle> {
  const res = await fetch(`${BASE}/vehicles`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseError(res, "Error al guardar el vehículo"));
  return res.json();
}

export async function updateVehicle(
  id: string,
  data: VehicleWrite
): Promise<Vehicle> {
  const res = await fetch(`${BASE}/vehicles/${id}`, {
    method: "PATCH",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseError(res, "Error al actualizar el vehículo"));
  return res.json();
}

export async function deleteVehicle(id: string): Promise<void> {
  const res = await fetch(`${BASE}/vehicles/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res, "Error al eliminar el vehículo"));
}

export async function uploadVehicleDocument(
  id: string,
  kind: VehicleDocKind,
  file: File
): Promise<Vehicle> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/vehicles/${id}/documents/${kind}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: form,
  });
  if (!res.ok) throw new Error(await parseError(res, "Error al subir el documento"));
  return res.json();
}

export async function deleteVehicleDocument(
  id: string,
  kind: VehicleDocKind
): Promise<Vehicle> {
  const res = await fetch(`${BASE}/vehicles/${id}/documents/${kind}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res, "Error al quitar el documento"));
  return res.json();
}

export async function openVehicleDocument(
  id: string,
  kind: VehicleDocKind
): Promise<void> {
  const res = await fetch(`${BASE}/vehicles/${id}/documents/${kind}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res, "No se pudo abrir el documento"));
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
}

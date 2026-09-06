function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export type PayLink = {
  id: string;
  name: string;
  url: string;
  notes: string;
  createdAt: string;
};

export type PayLinkWrite = {
  name: string;
  url: string;
  notes?: string;
};

export async function listPayLinks(): Promise<PayLink[]> {
  const res = await fetch(`${BASE}/pay-links`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Error al cargar las páginas de pago");
  return res.json();
}

export async function createPayLink(data: PayLinkWrite): Promise<PayLink> {
  const res = await fetch(`${BASE}/pay-links`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al guardar la página");
  }
  return res.json();
}

export async function updatePayLink(
  id: string,
  data: PayLinkWrite
): Promise<PayLink> {
  const res = await fetch(`${BASE}/pay-links/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al actualizar la página");
  }
  return res.json();
}

export async function deletePayLink(id: string): Promise<void> {
  const res = await fetch(`${BASE}/pay-links/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar la página");
}

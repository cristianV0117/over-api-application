function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  createdAt?: string;
};

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const res = await fetch(`${BASE}/admin/users`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "No se pudo cargar usuarios");
  }
  return res.json();
}

export async function adminImpersonate(userId: string): Promise<{ token: string; email: string }> {
  const res = await fetch(`${BASE}/admin/impersonate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "No se pudo iniciar modo infiltración");
  }
  return res.json();
}

export async function adminStopImpersonation(): Promise<{ token: string; email: string }> {
  const res = await fetch(`${BASE}/admin/impersonate/stop`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "No se pudo salir del modo infiltración");
  }
  return res.json();
}

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export type Profile = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
};

export async function getProfile(): Promise<Profile> {
  const res = await fetch(`${BASE}/me`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Error al cargar perfil");
  return res.json();
}

export async function updateProfile(data: {
  name?: string;
  avatar?: File;
}): Promise<Profile> {
  const formData = new FormData();
  if (data.name !== undefined) formData.append("name", data.name);
  if (data.avatar) formData.append("avatar", data.avatar);

  const res = await fetch(`${BASE}/me`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al actualizar perfil");
  }
  return res.json();
}

export function avatarUrl(url: string | null | undefined): string {
  if (!url) return "https://via.placeholder.com/32";
  if (url.startsWith("http")) return url;
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  return `${base.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
}

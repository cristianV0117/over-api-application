import type { CvConfig, CvHeader, CvSection, CvSummary, CvTheme } from "@/lib/cv/types";

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

async function parseError(res: Response): Promise<never> {
  let message = res.statusText;
  try {
    const data = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(data.message)) message = data.message.join(", ");
    else if (data.message) message = data.message;
  } catch {
    /* ignore */
  }
  throw new Error(message);
}

export async function fetchMyCvs(): Promise<CvSummary[]> {
  const res = await fetch(`${BASE}/cv/me`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchCv(id: string): Promise<CvConfig> {
  const res = await fetch(`${BASE}/cv/me/${encodeURIComponent(id)}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function createCv(payload?: { name?: string }): Promise<CvConfig> {
  const res = await fetch(`${BASE}/cv/me`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload ?? {}),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function saveCv(
  id: string,
  payload: {
    name?: string;
    locale?: "es" | "en";
    theme?: Partial<CvTheme>;
    header?: Partial<CvHeader>;
    sections?: CvSection[];
  }
): Promise<CvConfig> {
  const res = await fetch(`${BASE}/cv/me/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function translateCv(id: string): Promise<CvConfig> {
  const res = await fetch(`${BASE}/cv/me/${encodeURIComponent(id)}/translate`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function deleteCv(id: string): Promise<void> {
  const res = await fetch(`${BASE}/cv/me/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) await parseError(res);
}

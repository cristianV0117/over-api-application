import type { PortfolioConfig, PortfolioSection, PortfolioSummary, PortfolioTheme } from "@/lib/portfolio/types";

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

export async function fetchMyPortfolios(): Promise<PortfolioSummary[]> {
  const res = await fetch(`${BASE}/portfolio/me`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchPortfolio(id: string): Promise<PortfolioConfig> {
  const res = await fetch(`${BASE}/portfolio/me/${encodeURIComponent(id)}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function createPortfolio(payload?: { name?: string; slug?: string }): Promise<PortfolioConfig> {
  const res = await fetch(`${BASE}/portfolio/me`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload ?? {}),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function savePortfolio(
  id: string,
  payload: {
    name?: string;
    slug: string;
    published?: boolean;
    theme?: Partial<PortfolioTheme>;
    sections?: PortfolioSection[];
  }
): Promise<PortfolioConfig> {
  const res = await fetch(`${BASE}/portfolio/me/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function publishPortfolio(id: string): Promise<PortfolioConfig> {
  const res = await fetch(`${BASE}/portfolio/me/${encodeURIComponent(id)}/publish`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function unpublishPortfolio(id: string): Promise<PortfolioConfig> {
  const res = await fetch(`${BASE}/portfolio/me/${encodeURIComponent(id)}/unpublish`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function deletePortfolio(id: string): Promise<void> {
  const res = await fetch(`${BASE}/portfolio/me/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) await parseError(res);
}

export async function fetchPublicPortfolio(slug: string): Promise<PortfolioConfig> {
  const res = await fetch(`${BASE}/portfolio/public/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

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

export type WorkanaJob = {
  id: string;
  slug: string;
  title: string;
  url: string;
  authorName: string;
  description: string;
  skills: string[];
  budget: string;
  isHourly: boolean;
  isUrgent: boolean;
  hasVerifiedPaymentMethod: boolean;
  totalBids: number | null;
  postedDate: string;
  country: string;
  score: number;
  matchedSkills: string[];
  highlighted: boolean;
  notifiedAt: string | null;
  fetchedAt: string;
};

export type WorkanaList = {
  jobs: WorkanaJob[];
  lastFetchedAt: string | null;
  configured: boolean;
};

export async function fetchWorkanaJobs(opts?: {
  highlighted?: boolean;
  limit?: number;
}): Promise<WorkanaList> {
  const q = new URLSearchParams();
  if (opts?.highlighted) q.set("highlighted", "1");
  if (opts?.limit) q.set("limit", String(opts.limit));
  const res = await fetch(`${BASE}/workana/jobs?${q.toString()}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function syncWorkana(): Promise<{
  fetched: number;
  newHighlighted: number;
  error?: string;
}> {
  const res = await fetch(`${BASE}/workana/sync`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function ingestWorkana(
  payload: unknown,
  query = "php"
): Promise<{ fetched: number; newHighlighted: number }> {
  const results =
    payload && typeof payload === "object" && "results" in payload
      ? (payload as { results: unknown }).results
      : payload;
  const res = await fetch(`${BASE}/workana/ingest`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ results, query }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

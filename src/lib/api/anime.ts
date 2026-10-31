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

export type AnimeWatchStatus =
  | "watching"
  | "completed"
  | "planned"
  | "dropped"
  | "paused";

export const WATCH_STATUSES: AnimeWatchStatus[] = [
  "watching",
  "completed",
  "planned",
  "dropped",
  "paused",
];

export type AnimeNextEpisode = {
  episode: number;
  airingAt: number;
};

export type AnimeSearchItem = {
  anilistId: number;
  title: string;
  titleEnglish: string;
  coverImage: string;
  bannerImage?: string;
  genres: string[];
  format: string;
  episodes: number | null;
  anilistScore: number | null;
  seasonYear: number | null;
  anilistStatus?: string;
  description: string;
  nextEpisode?: AnimeNextEpisode | null;
};

export type AnimeEntry = {
  id: string;
  anilistId: number;
  title: string;
  titleEnglish: string;
  titleNative: string;
  coverImage: string;
  bannerImage: string;
  genres: string[];
  format: string;
  episodes: number | null;
  anilistScore: number | null;
  season: string;
  seasonYear: number | null;
  anilistStatus: string;
  description: string;
  studios: string[];
  siteUrl: string;
  watchStatus: AnimeWatchStatus;
  score: number | null;
  watchedEpisodes: number;
  favorite: boolean;
  notes: string;
  updatedAt: string;
};

export type AnimeStats = {
  total: number;
  byStatus: Record<string, { count: number; avgScore: number | null }>;
  avgScore: number | null;
  scoredCount: number;
};

export type AnimeRecommendation = AnimeSearchItem & {
  score: number;
  because: string[];
};

export type AnimeDetail = AnimeSearchItem & {
  titleNative: string;
  season: string;
  studios: string[];
  siteUrl: string;
  relations: {
    seasons: AnimeSearchItem[];
    movies: AnimeSearchItem[];
    ovas: AnimeSearchItem[];
    others: AnimeSearchItem[];
  };
};

export async function searchAnime(
  q: string,
  opts?: {
    page?: number;
    genre?: string;
    format?: string;
    sort?: string;
    mainOnly?: boolean;
  }
): Promise<{
  items: AnimeSearchItem[];
  page: number;
  hasNextPage: boolean;
  lastPage: number;
}> {
  const p = new URLSearchParams();
  if (q.trim()) p.set("q", q.trim());
  if (opts?.page) p.set("page", String(opts.page));
  if (opts?.genre) p.set("genre", opts.genre);
  if (opts?.format) p.set("format", opts.format);
  if (opts?.sort) p.set("sort", opts.sort);
  if (opts?.mainOnly) p.set("mainOnly", "1");
  const res = await fetch(`${BASE}/anime/search?${p.toString()}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchAnimeDetail(anilistId: number): Promise<AnimeDetail> {
  const res = await fetch(`${BASE}/anime/media/${anilistId}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchAnimeGenres(): Promise<string[]> {
  const res = await fetch(`${BASE}/anime/genres`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchMyAnime(opts?: {
  status?: AnimeWatchStatus | "";
  genre?: string;
  favorite?: boolean;
  q?: string;
}): Promise<AnimeEntry[]> {
  const p = new URLSearchParams();
  if (opts?.status) p.set("status", opts.status);
  if (opts?.genre) p.set("genre", opts.genre);
  if (opts?.favorite) p.set("favorite", "1");
  if (opts?.q) p.set("q", opts.q);
  const res = await fetch(`${BASE}/anime/me?${p.toString()}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchRecommendations(): Promise<AnimeRecommendation[]> {
  const res = await fetch(`${BASE}/anime/me/recommendations`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchAnimeStats(): Promise<AnimeStats> {
  const res = await fetch(`${BASE}/anime/me/stats`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function addAnime(data: {
  anilistId: number;
  watchStatus?: AnimeWatchStatus;
  score?: number;
}): Promise<AnimeEntry> {
  const res = await fetch(`${BASE}/anime/me`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function updateAnime(
  id: string,
  data: Partial<
    Pick<AnimeEntry, "watchStatus" | "score" | "watchedEpisodes" | "favorite" | "notes">
  >
): Promise<AnimeEntry> {
  const res = await fetch(`${BASE}/anime/me/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function deleteAnime(id: string): Promise<void> {
  const res = await fetch(`${BASE}/anime/me/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) await parseError(res);
}

export async function clearMyAnime(): Promise<{ deleted: number }> {
  const res = await fetch(`${BASE}/anime/me/all`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

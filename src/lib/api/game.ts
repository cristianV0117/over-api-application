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

export type GamePlayStatus =
  | "playing"
  | "completed"
  | "planned"
  | "dropped"
  | "paused";

export const PLAY_STATUSES: GamePlayStatus[] = [
  "playing",
  "completed",
  "planned",
  "dropped",
  "paused",
];

export type GameSearchItem = {
  steamId: number;
  title: string;
  coverImage: string;
  bannerImage?: string;
  genres: string[];
  platforms: string[];
  steamScore: number | null;
  metacritic: number | null;
  released: string;
  steamStatus: string;
  description: string;
  playtime: number | null;
};

export type GameEntry = GameSearchItem & {
  id: string;
  developers: string[];
  siteUrl: string;
  playStatus: GamePlayStatus;
  score: number | null;
  hoursPlayed: number;
  favorite: boolean;
  notes: string;
  updatedAt: string;
};

export type GameStats = {
  total: number;
  byStatus: Record<string, { count: number; avgScore: number | null }>;
  avgScore: number | null;
  scoredCount: number;
};

export type GameRecommendation = GameSearchItem & {
  score: number;
  because: string[];
};

export type GameDetail = GameSearchItem & {
  developers: string[];
  siteUrl: string;
  relations: {
    series: GameSearchItem[];
    extras: GameSearchItem[];
  };
};

export type GameGenre = { name: string; slug: string };

export async function searchGames(
  q: string,
  opts?: {
    page?: number;
    genre?: string;
    platform?: string;
    sort?: string;
    mainOnly?: boolean;
  }
): Promise<{
  items: GameSearchItem[];
  page: number;
  hasNextPage: boolean;
  lastPage: number;
}> {
  const p = new URLSearchParams();
  if (q.trim()) p.set("q", q.trim());
  if (opts?.page) p.set("page", String(opts.page));
  if (opts?.genre) p.set("genre", opts.genre);
  if (opts?.platform) p.set("platform", opts.platform);
  if (opts?.sort) p.set("sort", opts.sort);
  if (opts?.mainOnly) p.set("mainOnly", "1");
  const res = await fetch(`${BASE}/games/search?${p.toString()}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchGameDetail(steamId: number): Promise<GameDetail> {
  const res = await fetch(`${BASE}/games/media/${steamId}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchGameGenres(): Promise<GameGenre[]> {
  const res = await fetch(`${BASE}/games/genres`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchMyGames(): Promise<GameEntry[]> {
  const res = await fetch(`${BASE}/games/me`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchGameRecommendations(): Promise<GameRecommendation[]> {
  const res = await fetch(`${BASE}/games/me/recommendations`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchGameStats(): Promise<GameStats> {
  const res = await fetch(`${BASE}/games/me/stats`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function addGame(data: {
  steamId: number;
  playStatus?: GamePlayStatus;
  score?: number;
}): Promise<GameEntry> {
  const res = await fetch(`${BASE}/games/me`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function updateGame(
  id: string,
  data: Partial<Pick<GameEntry, "playStatus" | "score" | "hoursPlayed" | "favorite" | "notes">>
): Promise<GameEntry> {
  const res = await fetch(`${BASE}/games/me/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function deleteGame(id: string): Promise<void> {
  const res = await fetch(`${BASE}/games/me/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) await parseError(res);
}

export async function clearMyGames(): Promise<{ deleted: number }> {
  const res = await fetch(`${BASE}/games/me/all`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

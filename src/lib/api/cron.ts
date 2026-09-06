function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export type CronConfig = {
  enabled: boolean;
  everyMinutes: number;
  lastRunAt: string | null;
};

export type CronLog = {
  id: string;
  message: string;
  source: "scheduled" | "manual";
  createdAt: string;
};

export async function getCronConfig(): Promise<CronConfig> {
  const res = await fetch(`${BASE}/cron/config`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Error al cargar la config del cron");
  return res.json();
}

export async function putCronConfig(data: {
  enabled: boolean;
  everyMinutes: number;
}): Promise<CronConfig> {
  const res = await fetch(`${BASE}/cron/config`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al guardar el cron");
  }
  return res.json();
}

export async function listCronLogs(): Promise<CronLog[]> {
  const res = await fetch(`${BASE}/cron/logs?limit=80`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al cargar el log");
  const data = await res.json();
  return data.logs ?? [];
}

export async function runCronNow(): Promise<CronLog> {
  const res = await fetch(`${BASE}/cron/run`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al ejecutar el cron");
  const data = await res.json();
  return data.log;
}

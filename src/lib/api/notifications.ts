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

export type NotificationType =
  | "debt"
  | "recurring_expense"
  | "recurring_income"
  | "task"
  | "vehicle"
  | "cron";

export type NotificationSeverity = "info" | "warning" | "urgent";

export type AppNotification = {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  body: string;
  href: string;
  readAt: string | null;
  createdAt: string;
  meta: Record<string, unknown>;
};

export async function fetchNotifications(opts?: {
  unreadOnly?: boolean;
  limit?: number;
}): Promise<AppNotification[]> {
  const q = new URLSearchParams();
  if (opts?.unreadOnly) q.set("unread", "1");
  if (opts?.limit) q.set("limit", String(opts.limit));
  const res = await fetch(`${BASE}/notifications?${q.toString()}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await fetch(`${BASE}/notifications/unread-count`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  const data = (await res.json()) as { count: number };
  return data.count ?? 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  const res = await fetch(`${BASE}/notifications/${encodeURIComponent(id)}/read`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) await parseError(res);
}

export async function markAllNotificationsRead(): Promise<void> {
  const res = await fetch(`${BASE}/notifications/read-all`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) await parseError(res);
}

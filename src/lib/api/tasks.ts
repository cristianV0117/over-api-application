function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export type TaskPriority = "low" | "normal" | "high";

export const TASK_PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Baja" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "Alta" },
];

export type Task = {
  id: string;
  title: string;
  description?: string;
  statusId: string;
  statusName?: string;
  userId: string;
  dueDate?: string;
  priority?: TaskPriority;
};

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${BASE}/tasks`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Error al cargar tareas");
  return res.json();
}

export type TaskStatus = { id: string; name: string };

export async function getTaskStatuses(): Promise<TaskStatus[]> {
  const res = await fetch(`${BASE}/task-statuses`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al cargar estados");
  return res.json();
}

export async function createTask(data: {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
}): Promise<Task> {
  const res = await fetch(`${BASE}/tasks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al crear tarea");
  }
  return res.json();
}

export async function updateTaskStatus(
  taskId: string,
  statusId: string
): Promise<Task> {
  const res = await fetch(`${BASE}/tasks/${taskId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: statusId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al actualizar estado");
  }
  return res.json();
}

const PRIORITY_SORT_ORDER: Record<TaskPriority, number> = {
  high: 0,
  normal: 1,
  low: 2,
};

export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) =>
      (PRIORITY_SORT_ORDER[a.priority ?? "normal"] ?? 1) -
      (PRIORITY_SORT_ORDER[b.priority ?? "normal"] ?? 1)
  );
}

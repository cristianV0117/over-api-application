import type { Task, TaskStatus, TaskPriority } from "@/lib/api/tasks";
import { TASK_PRIORITIES } from "@/lib/api/tasks";

export const DUE_SOON_HOURS = 24;
const DUE_SOON_MS = DUE_SOON_HOURS * 60 * 60 * 1000;

/** Misma regla que en el tablero Kanban */
export function getDueUrgency(
  dueDate?: string,
  statusName?: string
): "overdue" | "due_soon" | null {
  if (!dueDate) return null;
  if (statusName?.toLowerCase() === "done") return null;
  const due = new Date(dueDate).getTime();
  const now = Date.now();
  if (due < now) return "overdue";
  if (due - now <= DUE_SOON_MS) return "due_soon";
  return null;
}

function statusAccent(name?: string): string {
  switch (name?.toLowerCase()) {
    case "done":
      return "#22c55e";
    case "in progress":
      return "#f59e0b";
    default:
      return "#7c3aed";
  }
}

export type TaskDashboardStats = {
  total: number;
  byStatus: { statusId: string; name: string; count: number; accent: string }[];
  byPriority: { value: TaskPriority; label: string; count: number }[];
  overdue: number;
  dueSoon: number;
};

export function buildTaskDashboardStats(
  tasks: Task[],
  statuses: TaskStatus[]
): TaskDashboardStats {
  const byStatus = statuses.map((s) => ({
    statusId: s.id,
    name: s.name,
    count: 0,
    accent: statusAccent(s.name),
  }));
  const statusIndex = new Map(byStatus.map((b, i) => [b.statusId, i]));

  for (const t of tasks) {
    const i = statusIndex.get(t.statusId);
    if (i !== undefined) byStatus[i].count += 1;
  }

  const pri: Record<TaskPriority, number> = { low: 0, normal: 0, high: 0 };
  for (const t of tasks) {
    pri[t.priority ?? "normal"] += 1;
  }

  const byPriority = (["high", "normal", "low"] as TaskPriority[]).map(
    (value) => ({
      value,
      label: TASK_PRIORITIES.find((p) => p.value === value)?.label ?? value,
      count: pri[value],
    })
  );

  let overdue = 0;
  let dueSoon = 0;
  for (const t of tasks) {
    const u = getDueUrgency(t.dueDate, t.statusName);
    if (u === "overdue") overdue += 1;
    else if (u === "due_soon") dueSoon += 1;
  }

  return {
    total: tasks.length,
    byStatus,
    byPriority,
    overdue,
    dueSoon,
  };
}

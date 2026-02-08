"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  getTasks,
  getTaskStatuses,
  updateTaskStatus,
  sortTasksByPriority,
  type Task,
  type TaskPriority,
  type TaskStatus,
  TASK_PRIORITIES,
} from "@/lib/api/tasks";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import { toast } from "react-toastify";

const COLUMN_ORDER = ["To Do", "In Progress", "Done"];
const DUE_SOON_MS = 24 * 60 * 60 * 1000; // 1 día

function getDueWarning(
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

function formatDueDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function priorityLabel(p: TaskPriority): string {
  return TASK_PRIORITIES.find((x) => x.value === p)?.label ?? p;
}

function priorityBadgeClass(p: TaskPriority): string {
  switch (p) {
    case "high":
      return "bg-danger";
    case "low":
      return "bg-secondary";
    default:
      return "bg-primary";
  }
}

function getStatusColor(statusName?: string): string {
  switch (statusName?.toLowerCase()) {
    case "done":
      return "#22c55e";
    case "in progress":
      return "#f59e0b";
    case "to do":
    default:
      return "#702CF4";
  }
}

function orderedStatuses(statuses: TaskStatus[]): TaskStatus[] {
  const indexOf = (name: string) => {
    const i = COLUMN_ORDER.findIndex(
      (s) => s.toLowerCase() === name.toLowerCase()
    );
    return i === -1 ? 999 : i;
  };
  return [...statuses].sort(
    (a, b) => indexOf(a.name) - indexOf(b.name)
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const alertedForTasksRef = useRef<string>("");

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch {
      toast.error("Error al cargar tareas");
    } finally {
      setLoading(false);
    }
  };

  const loadStatuses = async () => {
    try {
      const data = await getTaskStatuses();
      setStatuses(data);
    } catch {
      toast.error("Error al cargar estados");
    }
  };

  useEffect(() => {
    loadStatuses();
  }, []);

  useEffect(() => {
    loadTasks();
  }, []);

  // Alerta al cargar si hay tareas por vencer o vencidas (solo una vez por conjunto de tareas)
  useEffect(() => {
    if (loading || tasks.length === 0) return;
    const key = tasks.map((t) => `${t.id}-${t.dueDate ?? ""}`).join(",");
    if (alertedForTasksRef.current === key) return;
    const overdue = tasks.filter(
      (t) => getDueWarning(t.dueDate, t.statusName) === "overdue"
    );
    const dueSoon = tasks.filter(
      (t) => getDueWarning(t.dueDate, t.statusName) === "due_soon"
    );
    if (overdue.length > 0 || dueSoon.length > 0) {
      alertedForTasksRef.current = key;
      if (overdue.length > 0 && dueSoon.length > 0) {
        toast.warning(
          `${overdue.length} tarea(s) vencida(s) y ${dueSoon.length} por vencer en menos de 1 día`,
          { autoClose: 6000 }
        );
      } else if (overdue.length > 0) {
        toast.warning(
          `${overdue.length} tarea(s) vencida(s): ${overdue.map((t) => t.title).slice(0, 2).join(", ")}${overdue.length > 2 ? "..." : ""}`,
          { autoClose: 6000 }
        );
      } else {
        toast.warning(
          `${dueSoon.length} tarea(s) por vencer en menos de 1 día: ${dueSoon.map((t) => t.title).slice(0, 2).join(", ")}${dueSoon.length > 2 ? "..." : ""}`,
          { autoClose: 6000 }
        );
      }
    }
  }, [tasks, loading]);

  const columns = useMemo(() => orderedStatuses(statuses), [statuses]);

  const tasksByStatus = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const s of statuses) map.set(s.id, []);
    for (const t of tasks) {
      const list = map.get(t.statusId);
      if (list) list.push(t);
    }
    for (const [, list] of map) sortTasksByPriority(list);
    return map;
  }, [tasks, statuses]);

  const handleStatusChange = async (taskId: string, statusId: string) => {
    setUpdatingTaskId(taskId);
    try {
      const updated = await updateTaskStatus(taskId, statusId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updated : t))
      );
      toast.success("Estado actualizado");
    } catch {
      toast.error("Error al actualizar estado");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <div className="text-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-6 mb-0">Tareas</h1>
        <button
          type="button"
          className="btn d-flex align-items-center gap-2"
          style={{ backgroundColor: "#702CF4", color: "white" }}
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-lg" />
          Nueva tarea
        </button>
      </div>

      {loading ? (
        <p className="text-secondary">Cargando tareas...</p>
      ) : (
        <div
          className="d-flex gap-3 overflow-x-auto pb-2"
          style={{ minHeight: "70vh" }}
        >
          {columns.map((status) => {
            const columnTasks = tasksByStatus.get(status.id) ?? [];
            const headerColor = getStatusColor(status.name);
            return (
              <div
                key={status.id}
                className="flex-shrink-0 rounded-3 d-flex flex-column"
                style={{
                  width: "min(320px, 100%)",
                  backgroundColor: "rgba(27, 31, 34, 0.6)",
                  border: `1px solid ${headerColor}40`,
                }}
              >
                <div
                  className="rounded-top-3 px-3 py-2 d-flex align-items-center justify-content-between"
                  style={{
                    backgroundColor: `${headerColor}30`,
                    borderBottom: `2px solid ${headerColor}`,
                  }}
                >
                  <span className="fw-semibold text-white">{status.name}</span>
                  <span
                    className="badge rounded-pill"
                    style={{ backgroundColor: headerColor }}
                  >
                    {columnTasks.length}
                  </span>
                </div>
                <div
                  className="flex-grow-1 p-2 overflow-y-auto"
                  style={{ minHeight: "200px" }}
                >
                  {columnTasks.length === 0 ? (
                    <p className="text-secondary small text-center py-4 mb-0">
                      Sin tareas
                    </p>
                  ) : (
                    columnTasks.map((t) => {
                      const dueWarning = getDueWarning(t.dueDate, t.statusName);
                      return (
                        <div
                          key={t.id}
                          className="card border-0 shadow-sm mb-2"
                          style={{
                            backgroundColor: "#1B1F22",
                            ...(dueWarning
                              ? {
                                borderLeft: `3px solid ${dueWarning === "overdue" ? "#dc3545" : "#f59e0b"}`,
                              }
                              : {}),
                          }}
                        >
                          <div className="card-body py-2 px-3">
                            <div className="d-flex align-items-center gap-1 flex-wrap">
                              <h6 className="card-title text-white mb-0 text-truncate small flex-grow-1">
                                {t.title}
                              </h6>
                              {dueWarning && (
                                <span
                                  className="badge rounded-pill flex-shrink-0"
                                  style={{
                                    fontSize: "0.6rem",
                                    backgroundColor:
                                      dueWarning === "overdue"
                                        ? "#dc3545"
                                        : "#f59e0b",
                                  }}
                                >
                                  {dueWarning === "overdue"
                                    ? "Vencida"
                                    : "Por vencer"}
                                </span>
                              )}
                            </div>
                            <p
                              className="card-text text-secondary small mb-2"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {t.description ? (
                                t.description.length > 60
                                  ? `${t.description.slice(0, 60)}...`
                                  : t.description
                              ) : (
                                <span className="fst-italic">Sin descripción</span>
                              )}
                            </p>
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                              <span
                                className={`badge rounded-pill ${priorityBadgeClass(
                                  t.priority ?? "normal"
                                )}`}
                                style={{ fontSize: "0.65rem" }}
                              >
                                {priorityLabel(t.priority ?? "normal")}
                              </span>
                              {statuses.length > 0 && (
                                <select
                                  className="form-select form-select-sm border-0 rounded-pill text-white"
                                  style={{
                                    backgroundColor: getStatusColor(t.statusName),
                                    width: "auto",
                                    minWidth: "90px",
                                    cursor: "pointer",
                                    fontSize: "0.65rem",
                                    padding: "0.2rem 0.4rem",
                                  }}
                                  value={t.statusId}
                                  onChange={(e) =>
                                    handleStatusChange(t.id, e.target.value)
                                  }
                                  disabled={updatingTaskId === t.id}
                                  aria-label="Cambiar estado"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {statuses.map((s) => (
                                    <option
                                      key={s.id}
                                      value={s.id}
                                      className="bg-dark text-white"
                                    >
                                      {s.name}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                            <div className="text-secondary small mt-1" style={{ fontSize: "0.7rem" }}>
                              <i className="bi bi-calendar3 me-1" />
                              {formatDueDate(t.dueDate)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateTaskModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onCreated={loadTasks}
      />
    </div>
  );
}

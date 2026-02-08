"use client";

import { useEffect, useState } from "react";
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
      return "#22c55e"; // verde
    case "in progress":
      return "#f59e0b"; // ámbar/naranja
    case "to do":
    default:
      return "#702CF4"; // violeta
  }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(sortTasksByPriority(data));
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

  const handleStatusChange = async (taskId: string, statusId: string) => {
    setUpdatingTaskId(taskId);
    try {
      const updated = await updateTaskStatus(taskId, statusId);
      setTasks((prev) =>
        sortTasksByPriority(
          prev.map((t) => (t.id === taskId ? updated : t))
        )
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
      ) : tasks.length === 0 ? (
        <div
          className="rounded p-5 text-center"
          style={{ backgroundColor: "#1B1F22" }}
        >
          <i className="bi bi-inbox display-4 text-secondary" />
          <p className="mt-3 text-secondary mb-0">
            No hay tareas. Crea una con el botón &quot;Nueva tarea&quot;.
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {tasks.map((t) => (
            <div key={t.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div
                className="card h-100 border-0 shadow-sm"
                style={{ backgroundColor: "#1B1F22" }}
              >
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-white mb-2 text-truncate">
                    {t.title}
                  </h5>
                  <p className="card-text text-secondary small flex-grow-1 mb-3">
                    {t.description ? (
                      t.description.length > 80
                        ? `${t.description.slice(0, 80)}...`
                        : t.description
                    ) : (
                      <span className="fst-italic">Sin descripción</span>
                    )}
                  </p>
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    <span
                      className={`badge rounded-pill ${priorityBadgeClass(
                        t.priority ?? "normal"
                      )}`}
                    >
                      {priorityLabel(t.priority ?? "normal")}
                    </span>
                    {statuses.length > 0 ? (
                      <select
                        className="form-select form-select-sm border-0 rounded-pill text-white text-center"
                        style={{
                          backgroundColor: getStatusColor(t.statusName),
                          width: "auto",
                          minWidth: "100px",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                        }}
                        value={t.statusId}
                        onChange={(e) =>
                          handleStatusChange(t.id, e.target.value)
                        }
                        disabled={updatingTaskId === t.id}
                        aria-label="Cambiar estado"
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
                    ) : (
                      <span
                        className="badge rounded-pill"
                        style={{
                          backgroundColor: getStatusColor(t.statusName),
                        }}
                      >
                        {t.statusName ?? "—"}
                      </span>
                    )}
                  </div>
                  <div className="text-secondary small">
                    <i className="bi bi-calendar3 me-1" />
                    {formatDueDate(t.dueDate)}
                  </div>
                </div>
              </div>
            </div>
          ))}
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

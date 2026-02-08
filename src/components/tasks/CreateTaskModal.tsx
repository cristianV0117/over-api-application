"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import {
  createTask,
  TASK_PRIORITIES,
  type TaskPriority,
} from "@/lib/api/tasks";

interface CreateTaskModalProps {
  show: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateTaskModal({
  show,
  onClose,
  onCreated,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTask({
        title,
        description: description || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        priority,
      });
      toast.success("Tarea creada");
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("normal");
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear tarea");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal fade d-block show"
      tabIndex={-1}
      role="dialog"
      style={{
        backgroundColor: "rgba(0,0,0,0.7)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content bg-dark text-white">
          <div className="modal-header">
            <h5 className="modal-title">Nueva tarea</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Cerrar"
            />
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="taskTitle" className="form-label">
                  Título
                </label>
                <input
                  type="text"
                  id="taskTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-control bg-secondary text-white border-0"
                  placeholder="Ej: Revisar PRs"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="taskDescription" className="form-label">
                  Descripción (opcional)
                </label>
                <textarea
                  id="taskDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control bg-secondary text-white border-0"
                  rows={3}
                  placeholder="Detalles de la tarea..."
                />
              </div>
              <div className="mb-3">
                <label htmlFor="taskPriority" className="form-label">
                  Prioridad
                </label>
                <select
                  id="taskPriority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="form-select bg-secondary text-white border-0"
                >
                  {TASK_PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="taskDueDate" className="form-label">
                  Fecha límite (opcional)
                </label>
                <input
                  type="datetime-local"
                  id="taskDueDate"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="form-control bg-secondary text-white border-0"
                />
              </div>
              <button
                type="submit"
                className="btn w-100"
                style={{ backgroundColor: "#702CF4", color: "white" }}
                disabled={loading}
              >
                {loading ? "Creando..." : "Crear tarea"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

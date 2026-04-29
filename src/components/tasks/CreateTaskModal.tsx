"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
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

  const handleClose = () => {
    if (!loading) onClose();
  };

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

  return (
    <Dialog open={show} onClose={handleClose} maxWidth="sm" fullWidth scroll="body">
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pr: 6 }}>
          Nueva tarea
          <IconButton
            aria-label="cerrar"
            onClick={handleClose}
            disabled={loading}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Título"
            id="taskTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Revisar PRs"
            required
            fullWidth
            sx={{ mb: 2 }}
            autoFocus
          />
          <TextField
            label="Descripción (opcional)"
            id="taskDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalles de la tarea…"
            multiline
            rows={3}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="Prioridad"
            id="taskPriority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            fullWidth
            sx={{ mb: 2 }}
          >
            {TASK_PRIORITIES.map((p) => (
              <MenuItem key={p.value} value={p.value}>
                {p.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Fecha límite (opcional)"
            type="datetime-local"
            id="taskDueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} color="inherit" disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? "Creando…" : "Crear tarea"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

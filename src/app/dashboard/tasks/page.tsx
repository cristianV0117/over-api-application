"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  getTasks,
  getTaskStatuses,
  updateTaskStatus,
  patchTask,
  deleteTask,
  sortTasksByPriority,
  type Task,
  type TaskPriority,
  type TaskStatus,
  TASK_PRIORITIES,
} from "@/lib/api/tasks";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const COLUMN_ORDER = ["To Do", "In Progress", "Done"];
const DUE_SOON_MS = 24 * 60 * 60 * 1000;

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

function toDatetimeLocalValue(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getStatusColor(statusName?: string): string {
  switch (statusName?.toLowerCase()) {
    case "done":
      return "#22c55e";
    case "in progress":
      return "#f59e0b";
    case "to do":
    default:
      return "#7c3aed";
  }
}

function orderedStatuses(statuses: TaskStatus[]): TaskStatus[] {
  const indexOf = (name: string) => {
    const i = COLUMN_ORDER.findIndex(
      (s) => s.toLowerCase() === name.toLowerCase()
    );
    return i === -1 ? 999 : i;
  };
  return [...statuses].sort((a, b) => indexOf(a.name) - indexOf(b.name));
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const alertedForTasksRef = useRef<string>("");
  const titleBeforeEdit = useRef<Record<string, string>>({});
  const descBeforeEdit = useRef<Record<string, string>>({});
  const dueBeforeEdit = useRef<Record<string, string>>({});

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
          `${overdue.length} tarea(s) vencida(s): ${overdue.map((t) => t.title).slice(0, 2).join(", ")}${overdue.length > 2 ? "…" : ""}`,
          { autoClose: 6000 }
        );
      } else {
        toast.warning(
          `${dueSoon.length} tarea(s) por vencer en menos de 1 día: ${dueSoon.map((t) => t.title).slice(0, 2).join(", ")}${dueSoon.length > 2 ? "…" : ""}`,
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
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      toast.success("Estado actualizado");
    } catch {
      toast.error("Error al actualizar estado");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handlePriorityChange = async (taskId: string, priority: TaskPriority) => {
    setUpdatingTaskId(taskId);
    try {
      const updated = await patchTask(taskId, { priority });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch {
      toast.error("No se pudo actualizar la prioridad");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!confirm(`¿Eliminar la tarea «${title}»? No se puede deshacer.`)) return;
    setDeletingTaskId(taskId);
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success("Tarea eliminada");
    } catch {
      toast.error("No se pudo eliminar la tarea");
    } finally {
      setDeletingTaskId(null);
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        gap={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Tareas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Organiza el trabajo con columnas por estado. Arrastra mentalmente; aquí cambias el estado con el selector.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowModal(true)}
          sx={{ alignSelf: { sm: "center" } }}
        >
          Nueva tarea
        </Button>
      </Stack>

      {loading ? (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            overflowX: "auto",
          }}
        >
          <Stack direction="row" spacing={2} sx={{ flex: "0 0 auto", py: 0.5 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={420}
                sx={{ width: "min(320px, 88vw)", borderRadius: 2, flexShrink: 0 }}
              />
            ))}
          </Stack>
        </Box>
      ) : (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            overflowX: "auto",
            pb: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "flex-start",
              minHeight: "65vh",
              flex: "0 0 auto",
            }}
          >
          {columns.map((status) => {
            const columnTasks = tasksByStatus.get(status.id) ?? [];
            const headerColor = getStatusColor(status.name);
            return (
              <Box
                key={status.id}
                sx={{
                  flex: "0 0 auto",
                  width: "min(320px, 88vw)",
                  borderRadius: 2,
                  border: 1,
                  borderColor: `${headerColor}55`,
                  bgcolor: "background.paper",
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "calc(100vh - 220px)",
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    bgcolor: `${headerColor}22`,
                    borderBottom: 2,
                    borderColor: headerColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography fontWeight={700}>{status.name}</Typography>
                  <Chip
                    size="small"
                    label={columnTasks.length}
                    sx={{ bgcolor: headerColor, color: "#fff", fontWeight: 700 }}
                  />
                </Box>
                <Box sx={{ p: 1.5, overflowY: "auto", flex: 1, minHeight: 120 }}>
                  {columnTasks.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                      Sin tareas
                    </Typography>
                  ) : (
                    columnTasks.map((t) => {
                      const dueWarning = getDueWarning(t.dueDate, t.statusName);
                      return (
                        <Card
                          key={t.id}
                          variant="outlined"
                          sx={{
                            mb: 1.5,
                            bgcolor: "action.hover",
                            borderLeftWidth: dueWarning ? 3 : 1,
                            borderLeftColor:
                              dueWarning === "overdue"
                                ? "error.main"
                                : dueWarning === "due_soon"
                                  ? "warning.main"
                                  : "divider",
                          }}
                        >
                          <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 0.5,
                                mb: 0.5,
                              }}
                            >
                              <TextField
                                size="small"
                                label="Título"
                                value={t.title}
                                sx={{ flex: 1, minWidth: 0 }}
                                onChange={(e) =>
                                  setTasks((prev) =>
                                    prev.map((x) =>
                                      x.id === t.id ? { ...x, title: e.target.value } : x
                                    )
                                  )
                                }
                                onFocus={() => {
                                  titleBeforeEdit.current[t.id] = t.title;
                                }}
                                onBlur={async (e) => {
                                  const v = e.target.value.trim();
                                  if (v === titleBeforeEdit.current[t.id]) return;
                                  if (!v) {
                                    setTasks((prev) =>
                                      prev.map((x) =>
                                        x.id === t.id
                                          ? { ...x, title: titleBeforeEdit.current[t.id] }
                                          : x
                                      )
                                    );
                                    return;
                                  }
                                  try {
                                    const updated = await patchTask(t.id, { title: v });
                                    setTasks((prev) =>
                                      prev.map((x) => (x.id === t.id ? updated : x))
                                    );
                                  } catch {
                                    toast.error("No se pudo guardar el título");
                                    setTasks((prev) =>
                                      prev.map((x) =>
                                        x.id === t.id
                                          ? { ...x, title: titleBeforeEdit.current[t.id] }
                                          : x
                                      )
                                    );
                                  }
                                }}
                                variant="standard"
                                InputProps={{ disableUnderline: false }}
                              />
                              {dueWarning && (
                                <Chip
                                  size="small"
                                  label={dueWarning === "overdue" ? "Vencida" : "Por vencer"}
                                  color={dueWarning === "overdue" ? "error" : "warning"}
                                  sx={{ height: 22, fontSize: "0.65rem", flexShrink: 0, mt: 0.5 }}
                                />
                              )}
                              <Tooltip title="Eliminar tarea">
                                <span>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    aria-label={`Eliminar ${t.title}`}
                                    disabled={
                                      deletingTaskId === t.id || updatingTaskId === t.id
                                    }
                                    onClick={() => handleDeleteTask(t.id, t.title)}
                                    sx={{ flexShrink: 0 }}
                                  >
                                    <DeleteOutlineIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Box>
                            <TextField
                              size="small"
                              fullWidth
                              label="Descripción"
                              multiline
                              minRows={2}
                              placeholder="Sin descripción"
                              value={t.description ?? ""}
                              onChange={(e) =>
                                setTasks((prev) =>
                                  prev.map((x) =>
                                    x.id === t.id ? { ...x, description: e.target.value } : x
                                  )
                                )
                              }
                              onFocus={() => {
                                descBeforeEdit.current[t.id] = t.description ?? "";
                              }}
                              onBlur={async (e) => {
                                const v = e.target.value;
                                if (v === descBeforeEdit.current[t.id]) return;
                                try {
                                  const updated = await patchTask(t.id, {
                                    description: v.trim() || undefined,
                                  });
                                  setTasks((prev) =>
                                    prev.map((x) => (x.id === t.id ? updated : x))
                                  );
                                } catch {
                                  toast.error("No se pudo guardar la descripción");
                                  setTasks((prev) =>
                                    prev.map((x) =>
                                      x.id === t.id
                                        ? {
                                            ...x,
                                            description: descBeforeEdit.current[t.id],
                                          }
                                        : x
                                    )
                                  );
                                }
                              }}
                              variant="outlined"
                              sx={{ mt: 1 }}
                            />
                            <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                              <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select
                                  value={t.priority ?? "normal"}
                                  onChange={(e) =>
                                    handlePriorityChange(
                                      t.id,
                                      e.target.value as TaskPriority
                                    )
                                  }
                                  disabled={updatingTaskId === t.id}
                                  displayEmpty
                                  sx={{ fontSize: "0.8rem" }}
                                  inputProps={{ "aria-label": "Prioridad" }}
                                >
                                  {TASK_PRIORITIES.map((p) => (
                                    <MenuItem key={p.value} value={p.value} dense>
                                      {p.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                              {statuses.length > 0 && (
                                <FormControl size="small" sx={{ minWidth: 110 }}>
                                  <Select
                                    value={t.statusId}
                                    onChange={(e) =>
                                      handleStatusChange(t.id, e.target.value as string)
                                    }
                                    disabled={updatingTaskId === t.id}
                                    sx={{
                                      fontSize: "0.75rem",
                                      bgcolor: getStatusColor(t.statusName),
                                      color: "#fff",
                                      borderRadius: 10,
                                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                    }}
                                    inputProps={{ "aria-label": "Cambiar estado" }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {statuses.map((s) => (
                                      <MenuItem key={s.id} value={s.id} dense>
                                        {s.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              )}
                            </Stack>
                            <TextField
                              type="datetime-local"
                              size="small"
                              fullWidth
                              label="Vencimiento"
                              value={toDatetimeLocalValue(t.dueDate)}
                              onChange={(e) => {
                                const iso = e.target.value
                                  ? new Date(e.target.value).toISOString()
                                  : undefined;
                                setTasks((prev) =>
                                  prev.map((x) =>
                                    x.id === t.id ? { ...x, dueDate: iso } : x
                                  )
                                );
                              }}
                              onFocus={() => {
                                dueBeforeEdit.current[t.id] = t.dueDate ?? "";
                              }}
                              onBlur={async (e) => {
                                const localVal = e.target.value;
                                const newIso = localVal
                                  ? new Date(localVal).toISOString()
                                  : undefined;
                                const prev = dueBeforeEdit.current[t.id] || undefined;
                                if (newIso === prev || (!newIso && !prev)) return;
                                try {
                                  const updated = await patchTask(t.id, {
                                    dueDate: newIso,
                                  });
                                  setTasks((prevTasks) =>
                                    prevTasks.map((x) => (x.id === t.id ? updated : x))
                                  );
                                } catch {
                                  toast.error("No se pudo guardar la fecha");
                                  setTasks((prevTasks) =>
                                    prevTasks.map((x) =>
                                      x.id === t.id
                                        ? { ...x, dueDate: prev }
                                        : x
                                    )
                                  );
                                }
                              }}
                              sx={{ mt: 1 }}
                              InputLabelProps={{ shrink: true }}
                            />
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </Box>
              </Box>
            );
          })}
          </Box>
        </Box>
      )}

      <CreateTaskModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onCreated={loadTasks}
      />
    </Box>
  );
}

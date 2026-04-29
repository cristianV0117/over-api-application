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
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

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

function priorityColor(
  p: TaskPriority
): "error" | "default" | "primary" | "warning" {
  switch (p) {
    case "high":
      return "error";
    case "low":
      return "default";
    default:
      return "primary";
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
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={420} sx={{ flex: 1, borderRadius: 2 }} />
          ))}
        </Stack>
      ) : (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            pb: 1,
            minHeight: "65vh",
            alignItems: "flex-start",
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
                            <Stack direction="row" alignItems="flex-start" spacing={0.5} flexWrap="wrap" useFlexGap>
                              <Typography variant="subtitle2" sx={{ flex: "1 1 auto", fontWeight: 700 }} noWrap>
                                {t.title}
                              </Typography>
                              {dueWarning && (
                                <Chip
                                  size="small"
                                  label={dueWarning === "overdue" ? "Vencida" : "Por vencer"}
                                  color={dueWarning === "overdue" ? "error" : "warning"}
                                  sx={{ height: 22, fontSize: "0.65rem" }}
                                />
                              )}
                            </Stack>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                mt: 0.5,
                                minHeight: 32,
                                fontStyle: t.description ? "normal" : "italic",
                              }}
                            >
                              {t.description
                                ? t.description.length > 60
                                  ? `${t.description.slice(0, 60)}…`
                                  : t.description
                                : "Sin descripción"}
                            </Typography>
                            <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                              <Chip
                                size="small"
                                label={priorityLabel(t.priority ?? "normal")}
                                color={priorityColor(t.priority ?? "normal")}
                                variant={t.priority === "low" ? "outlined" : "filled"}
                                sx={{ height: 22, fontSize: "0.65rem" }}
                              />
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
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mt: 1, display: "flex", alignItems: "center", gap: 0.5 }}
                            >
                              <CalendarMonthOutlinedIcon sx={{ fontSize: 14 }} />
                              {formatDueDate(t.dueDate)}
                            </Typography>
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
      )}

      <CreateTaskModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onCreated={loadTasks}
      />
    </Box>
  );
}

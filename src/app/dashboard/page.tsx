"use client";

import NextLink from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/context/userContext";
import { getTasks, getTaskStatuses } from "@/lib/api/tasks";
import { buildTaskDashboardStats } from "@/lib/taskStats";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import type { Task, TaskStatus } from "@/lib/api/tasks";

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  loading,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        flex: "1 1 160px",
        minWidth: 160,
        borderColor: "divider",
        background: `linear-gradient(135deg, rgba(124, 58, 237, 0.06) 0%, transparent 55%)`,
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {title}
            </Typography>
            {loading ? (
              <Skeleton width={48} height={40} sx={{ mt: 0.5 }} />
            ) : (
              <Typography variant="h4" fontWeight={800} sx={{ color, lineHeight: 1.15, mt: 0.5 }}>
                {value}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color: "text.secondary", opacity: 0.9 }}>{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const user = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [t, s] = await Promise.all([getTasks(), getTaskStatuses()]);
        if (!cancelled) {
          setTasks(t);
          setStatuses(s);
        }
      } catch {
        if (!cancelled) toast.error("No se pudieron cargar las estadísticas de tareas");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(
    () => buildTaskDashboardStats(tasks, statuses),
    [tasks, statuses]
  );

  const maxStatusCount = useMemo(
    () => Math.max(1, ...stats.byStatus.map((x) => x.count)),
    [stats.byStatus]
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Hola, {user?.name?.split(" ")[0] ?? "equipo"}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 640 }}>
        Resumen de tus tareas y accesos rápidos.
        <Box component="span" sx={{ display: "block", mt: 0.5, opacity: 0.9 }}>
          {user?.email}
        </Box>
      </Typography>

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        Estadísticas de tareas
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 720 }}>
        Calculadas en el navegador con los mismos datos que el tablero (
        <Box component="span" fontWeight={600}>GET /tasks</Box> y{" "}
        <Box component="span" fontWeight={600}>GET /task-statuses</Box>
        ). No hace falta un endpoint extra mientras el listado sea manejable.
      </Typography>

      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={2} sx={{ mb: 3 }}>
        <StatCard
          title="Total"
          value={stats.total}
          subtitle="Tareas registradas"
          icon={<AssignmentTurnedInOutlinedIcon />}
          color="primary.main"
          loading={loading}
        />
        <StatCard
          title="Por vencer"
          value={stats.dueSoon}
          subtitle="Vence en ≤ 24 h (excl. Done)"
          icon={<EventOutlinedIcon />}
          color="warning.main"
          loading={loading}
        />
        <StatCard
          title="Vencidas"
          value={stats.overdue}
          subtitle="Pendientes con fecha pasada"
          icon={<WarningAmberOutlinedIcon />}
          color="error.main"
          loading={loading}
        />
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }} alignItems="stretch">
        <Card variant="outlined" sx={{ flex: 1, minWidth: 0, borderColor: "divider" }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Por estado
            </Typography>
            {loading ? (
              <Stack spacing={1}>
                <Skeleton height={32} />
                <Skeleton height={32} />
                <Skeleton height={32} />
              </Stack>
            ) : stats.byStatus.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Sin estados configurados o aún sin tareas.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {stats.byStatus.map((s) => (
                  <Box key={s.statusId}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {s.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.count} ({stats.total ? Math.round((s.count / stats.total) * 100) : 0}%)
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(s.count / maxStatusCount) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 99,
                        bgcolor: "action.hover",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 99,
                          bgcolor: s.accent,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ flex: 1, minWidth: 0, borderColor: "divider", maxWidth: { md: 420 } }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Por prioridad
            </Typography>
            {loading ? (
              <Skeleton height={120} />
            ) : (
              <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
                {stats.byPriority.map((p) => (
                  <Box
                    key={p.value}
                    sx={{
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      border: 1,
                      borderColor: "divider",
                      minWidth: 100,
                    }}
                  >
                    <Typography variant="h5" fontWeight={800}>
                      {p.count}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        Accesos rápidos
      </Typography>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} useFlexGap flexWrap="wrap">
        <Card variant="outlined" sx={{ flex: "1 1 260px", maxWidth: 360 }}>
          <CardContent>
            <PeopleOutlineIcon color="primary" sx={{ mb: 1 }} />
            <Typography variant="h6" fontWeight={700}>
              Usuarios
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Roles, permisos y alta de miembros.
            </Typography>
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button component={NextLink} href="/dashboard/users" variant="contained" size="small">
              Ir a usuarios
            </Button>
          </CardActions>
        </Card>
        <Card variant="outlined" sx={{ flex: "1 1 260px", maxWidth: 360 }}>
          <CardContent>
            <ViewKanbanOutlinedIcon color="primary" sx={{ mb: 1 }} />
            <Typography variant="h6" fontWeight={700}>
              Tareas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tablero Kanban y prioridades.
            </Typography>
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button component={NextLink} href="/dashboard/tasks" variant="contained" size="small">
              Ir a tareas
            </Button>
          </CardActions>
        </Card>
        <Card variant="outlined" sx={{ flex: "1 1 260px", maxWidth: 360 }}>
          <CardContent>
            <PersonOutlineIcon color="primary" sx={{ mb: 1 }} />
            <Typography variant="h6" fontWeight={700}>
              Perfil
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nombre y foto de perfil.
            </Typography>
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button component={NextLink} href="/dashboard/profile" variant="outlined" size="small">
              Editar perfil
            </Button>
          </CardActions>
        </Card>
      </Stack>
    </Box>
  );
}

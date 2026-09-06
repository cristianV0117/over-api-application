"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import {
  getCronConfig,
  listCronLogs,
  putCronConfig,
  runCronNow,
  type CronConfig,
  type CronLog,
  type CronScheduleType,
} from "@/lib/api/cron";
import { useUser } from "@/context/userContext";

const INTERVALS = [
  { v: 1, label: "Cada 1 minuto" },
  { v: 5, label: "Cada 5 minutos" },
  { v: 15, label: "Cada 15 minutos" },
  { v: 30, label: "Cada 30 minutos" },
  { v: 60, label: "Cada 1 hora" },
  { v: 360, label: "Cada 6 horas" },
  { v: 1440, label: "Cada 24 horas" },
];

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

export default function CronPage() {
  const router = useRouter();
  const user = useUser();
  const [config, setConfig] = useState<CronConfig | null>(null);
  const [scheduleType, setScheduleType] = useState<CronScheduleType>("interval");
  const [everyMinutes, setEveryMinutes] = useState(5);
  const [cronExpression, setCronExpression] = useState("40 3 * * 1-5");
  const [randomDelay, setRandomDelay] = useState(0);
  const [logs, setLogs] = useState<CronLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);

  const applyConfig = (cfg: CronConfig) => {
    setConfig(cfg);
    setScheduleType(cfg.scheduleType || "interval");
    setEveryMinutes(cfg.everyMinutes);
    setCronExpression(cfg.cronExpression || "40 3 * * 1-5");
    setRandomDelay(cfg.randomDelayMaxSeconds ?? 0);
  };

  const refresh = useCallback(async () => {
    const [cfg, list] = await Promise.all([getCronConfig(), listCronLogs()]);
    applyConfig(cfg);
    setLogs(list);
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    refresh()
      .catch((e) =>
        toast.error(e instanceof Error ? e.message : "Error al cargar")
      )
      .finally(() => setLoading(false));
  }, [refresh, user?.role]);

  useEffect(() => {
    if (!config?.enabled) return;
    const id = setInterval(() => {
      void listCronLogs()
        .then(setLogs)
        .catch(() => undefined);
    }, 20_000);
    return () => clearInterval(id);
  }, [config?.enabled]);

  const save = async (enabled = config?.enabled ?? false) => {
    setSaving(true);
    try {
      const next = await putCronConfig({
        enabled,
        scheduleType,
        everyMinutes,
        cronExpression,
        randomDelayMaxSeconds: randomDelay,
      });
      applyConfig(next);
      toast.success("Cron actualizado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  const runNow = async () => {
    setRunning(true);
    try {
      const log = await runCronNow();
      setLogs((prev) => [log, ...prev].slice(0, 40));
      setConfig((c) => (c ? { ...c, lastRunAt: log.createdAt } : c));
      toast.success("Check-in ejecutado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo ejecutar");
    } finally {
      setRunning(false);
    }
  };

  if (!user || loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (user.role !== "admin") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", width: "100%" }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
        Cron
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Check-in programado vía POST a SesameTime. Credenciales en variables de
        entorno del API (<code>EMPLOYEE_ID</code>, <code>AUTHORIZATION</code>,{" "}
        <code>COOKIE</code>, etc.). Horario en America/Bogota.
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "center" }}
            flexWrap="wrap"
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Switch
                checked={!!config?.enabled}
                disabled={!config || saving}
                onChange={(_, v) => void save(v)}
              />
              <Typography variant="body2">
                {config?.enabled ? "Activo" : "Pausado"}
              </Typography>
            </Stack>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Modo</InputLabel>
              <Select
                label="Modo"
                value={scheduleType}
                disabled={!config || saving}
                onChange={(e) =>
                  setScheduleType(e.target.value as CronScheduleType)
                }
              >
                <MenuItem value="interval">Intervalo</MenuItem>
                <MenuItem value="cron">Expresión cron</MenuItem>
              </Select>
            </FormControl>
            {scheduleType === "interval" ? (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Intervalo</InputLabel>
                <Select
                  label="Intervalo"
                  value={everyMinutes}
                  disabled={!config || saving}
                  onChange={(e) => setEveryMinutes(Number(e.target.value))}
                >
                  {INTERVALS.map((x) => (
                    <MenuItem key={x.v} value={x.v}>
                      {x.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                size="small"
                label="Cron (min hora día mes weekday)"
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
                disabled={!config || saving}
                sx={{ minWidth: 220 }}
                helperText="Ej. 40 3 * * 1-5 → lun–vie 03:40 Bogotá"
              />
            )}
            <TextField
              size="small"
              type="number"
              label="Delay aleatorio máx. (s)"
              value={randomDelay}
              onChange={(e) => setRandomDelay(Number(e.target.value))}
              disabled={!config || saving || scheduleType !== "cron"}
              inputProps={{ min: 0, max: 600 }}
              sx={{ width: 190 }}
              helperText="Como sleep RANDOM; 0 = sin espera"
            />
          </Stack>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Button
              variant="contained"
              startIcon={<SaveOutlinedIcon />}
              onClick={() => void save()}
              disabled={!config || saving}
            >
              Guardar horario
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PlayArrowIcon />}
              onClick={() => void runNow()}
              disabled={running || loading}
            >
              Ejecutar ahora
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() =>
                void refresh().catch((e) =>
                  toast.error(e instanceof Error ? e.message : "Error")
                )
              }
              disabled={loading}
            >
              Actualizar log
            </Button>
          </Stack>
          {config?.lastRunAt ? (
            <Typography variant="caption" color="text.secondary">
              Última corrida: {formatWhen(config.lastRunAt)} · TZ{" "}
              {config.timezone}
            </Typography>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Todavía no corrió. Guardá el horario, activalo o usá «Ejecutar
              ahora».
            </Typography>
          )}
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Log
        </Typography>
        {loading ? (
          <Typography variant="body2" color="text.secondary">
            Cargando…
          </Typography>
        ) : logs.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Vacío. Al correr vas a ver el script demo (URL ficticia + respuesta
            inventada).
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {logs.map((l) => (
              <Box
                key={l.id}
                component="pre"
                sx={{
                  m: 0,
                  p: 1.5,
                  overflow: "auto",
                  borderRadius: 1,
                  bgcolor: "rgba(0,0,0,0.35)",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: "0.75rem",
                  lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {`[${formatWhen(l.createdAt)}] (${l.source === "manual" ? "manual" : "cron"})\n${l.message}`}
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
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
import Typography from "@mui/material/Typography";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  getCronConfig,
  listCronLogs,
  putCronConfig,
  runCronNow,
  type CronConfig,
  type CronLog,
} from "@/lib/api/cron";

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
  const [config, setConfig] = useState<CronConfig | null>(null);
  const [logs, setLogs] = useState<CronLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);

  const refresh = useCallback(async () => {
    const [cfg, list] = await Promise.all([getCronConfig(), listCronLogs()]);
    setConfig(cfg);
    setLogs(list);
  }, []);

  useEffect(() => {
    refresh()
      .catch((e) =>
        toast.error(e instanceof Error ? e.message : "Error al cargar")
      )
      .finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    if (!config?.enabled) return;
    const id = setInterval(() => {
      void listCronLogs()
        .then(setLogs)
        .catch(() => undefined);
    }, 20_000);
    return () => clearInterval(id);
  }, [config?.enabled]);

  const save = async (patch: Partial<CronConfig>) => {
    if (!config) return;
    setSaving(true);
    try {
      const next = await putCronConfig({
        enabled: patch.enabled ?? config.enabled,
        everyMinutes: patch.everyMinutes ?? config.everyMinutes,
      });
      setConfig(next);
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
      setLogs((prev) => [log, ...prev].slice(0, 80));
      setConfig((c) =>
        c ? { ...c, lastRunAt: log.createdAt } : c
      );
      toast.success("Se escribió hola mundo");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo ejecutar");
    } finally {
      setRunning(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 820, mx: "auto", width: "100%" }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
        Cron
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Tarea de prueba: escribe <strong>hola mundo</strong> en el log. El
        servidor la corre solo si está activo y ya pasó el intervalo. El API
        tiene que estar encendido.
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
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
              onChange={(_, v) => void save({ enabled: v })}
            />
            <Typography variant="body2">
              {config?.enabled ? "Activo" : "Pausado"}
            </Typography>
          </Stack>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Intervalo</InputLabel>
            <Select
              label="Intervalo"
              value={config?.everyMinutes ?? 5}
              disabled={!config || saving}
              onChange={(e) =>
                void save({ everyMinutes: Number(e.target.value) })
              }
            >
              {INTERVALS.map((x) => (
                <MenuItem key={x.v} value={x.v}>
                  {x.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
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
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5 }}>
            Última corrida: {formatWhen(config.lastRunAt)}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5 }}>
            Todavía no corrió. Activalo o usá «Ejecutar ahora».
          </Typography>
        )}
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
            Vacío. Cuando corra el cron vas a ver «hola mundo» acá.
          </Typography>
        ) : (
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 1.5,
              maxHeight: 420,
              overflow: "auto",
              borderRadius: 1,
              bgcolor: "rgba(0,0,0,0.35)",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "0.8rem",
              lineHeight: 1.6,
            }}
          >
            {logs
              .map(
                (l) =>
                  `[${formatWhen(l.createdAt)}] ${l.message} (${l.source === "manual" ? "manual" : "cron"})`
              )
              .join("\n")}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import RefreshIcon from "@mui/icons-material/Refresh";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { toast } from "react-toastify";
import { useUser } from "@/context/userContext";
import { usePreferences } from "@/context/preferencesContext";
import TextField from "@mui/material/TextField";
import {
  fetchWorkanaJobs,
  ingestWorkana,
  syncWorkana,
  type WorkanaJob,
} from "@/lib/api/workana";

export default function WorkanaPage() {
  const router = useRouter();
  const user = useUser();
  const { t, locale } = usePreferences();
  const [jobs, setJobs] = useState<WorkanaJob[]>([]);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [paste, setPaste] = useState("");
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  const load = useCallback(async () => {
    const data = await fetchWorkanaJobs({ limit: 60 });
    setJobs(data.jobs);
    setLastFetchedAt(data.lastFetchedAt);
  }, []);

  useEffect(() => {
    if (user?.role !== "admin") return;
    load()
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [load, user?.role]);

  const sync = async () => {
    setSyncing(true);
    try {
      const res = await syncWorkana();
      if (res.error) {
        toast.error(t("workana.syncError"));
        return;
      }
      await load();
      toast.success(
        t("workana.synced")
          .replace("{fetched}", String(res.fetched))
          .replace("{new}", String(res.newHighlighted))
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("workana.syncError"));
    } finally {
      setSyncing(false);
    }
  };

  if (!user || user.role !== "admin") return null;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 960, mx: "auto" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        gap={1.5}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            {t("workana.title")}
          </Typography>
          <Typography color="text.secondary">{t("workana.subtitle")}</Typography>
          {lastFetchedAt && (
            <Typography variant="caption" color="text.disabled">
              {t("workana.lastSync")}:{" "}
              {new Date(lastFetchedAt).toLocaleString(locale === "en" ? "en-US" : "es-CO")}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => void sync()}
          disabled={syncing}
        >
          {syncing ? t("workana.syncing") : t("workana.sync")}
        </Button>
      </Stack>

      <Alert severity="warning" sx={{ mb: 2 }}>
        {t("workana.noCookie")}
      </Alert>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography fontWeight={700} sx={{ mb: 0.5 }}>
          {t("workana.importTitle")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {t("workana.importHelp")}
        </Typography>
        <TextField
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          multiline
          minRows={5}
          fullWidth
          placeholder='{ "results": { "results": [ ... ] } }'
        />
        <Button
          sx={{ mt: 1.5 }}
          variant="contained"
          disabled={importing || !paste.trim()}
          onClick={() => {
            void (async () => {
              setImporting(true);
              try {
                const parsed: unknown = JSON.parse(paste);
                const res = await ingestWorkana(parsed);
                setPaste("");
                await load();
                toast.success(
                  t("workana.synced")
                    .replace("{fetched}", String(res.fetched))
                    .replace("{new}", String(res.newHighlighted))
                );
              } catch (e) {
                toast.error(
                  e instanceof SyntaxError
                    ? t("workana.importError")
                    : e instanceof Error
                      ? e.message
                      : t("workana.importError")
                );
              } finally {
                setImporting(false);
              }
            })();
          }}
        >
          {importing ? t("workana.importing") : t("workana.import")}
        </Button>
      </Paper>

      {jobs.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">{t("workana.empty")}</Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {jobs.map((job) => (
            <Paper key={job.id} variant="outlined" sx={{ p: 2.25 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 0.75 }}>
                {job.highlighted && (
                  <Chip size="small" color="primary" label={t("workana.match")} />
                )}
                {job.hasVerifiedPaymentMethod && (
                  <Chip size="small" color="success" label={t("workana.verified")} />
                )}
                {job.isHourly && <Chip size="small" label={t("workana.hourly")} />}
                {job.isUrgent && <Chip size="small" color="warning" label={t("workana.urgent")} />}
                <Chip size="small" variant="outlined" label={`Score ${job.score}`} />
              </Stack>
              <Typography fontWeight={800}>{job.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {job.budget}
                {job.country ? ` · ${job.country}` : ""}
                {job.postedDate ? ` · ${job.postedDate}` : ""}
                {job.totalBids != null ? ` · ${job.totalBids} ${t("workana.bids")}` : ""}
              </Typography>
              {job.description && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {job.description}
                </Typography>
              )}
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                {job.skills.slice(0, 8).map((s) => (
                  <Chip
                    key={s}
                    size="small"
                    label={s}
                    color={job.matchedSkills.some((m) => s.toLowerCase().includes(m)) ? "primary" : "default"}
                    variant={job.matchedSkills.some((m) => s.toLowerCase().includes(m)) ? "filled" : "outlined"}
                  />
                ))}
              </Stack>
              <Button
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewIcon />}
                sx={{ mt: 1.25 }}
              >
                {t("workana.open")}
              </Button>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}

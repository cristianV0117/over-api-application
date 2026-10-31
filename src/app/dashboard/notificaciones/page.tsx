"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { usePreferences } from "@/context/preferencesContext";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
  type NotificationType,
} from "@/lib/api/notifications";
import type { MessageKey } from "@/i18n/messages/es";

const TYPE_COLOR: Record<NotificationType, "default" | "primary" | "warning" | "error" | "success" | "info"> = {
  debt: "warning",
  recurring_expense: "warning",
  recurring_income: "success",
  task: "primary",
  vehicle: "error",
  cron: "error",
};

const TYPE_LABEL: Record<NotificationType, MessageKey> = {
  debt: "notif.type.debt",
  recurring_expense: "notif.type.recurring_expense",
  recurring_income: "notif.type.recurring_income",
  task: "notif.type.task",
  vehicle: "notif.type.vehicle",
  cron: "notif.type.cron",
};

export default function NotificationsPage() {
  const router = useRouter();
  const { t, locale } = usePreferences();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const load = useCallback(async () => {
    const list = await fetchNotifications({ limit: 100 });
    setItems(list);
  }, []);

  useEffect(() => {
    load()
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  const typeLabel = (type: NotificationType) => t(TYPE_LABEL[type]);

  const open = async (n: AppNotification) => {
    if (!n.readAt) {
      try {
        await markNotificationRead(n.id);
        setItems((prev) =>
          prev.map((x) =>
            x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x
          )
        );
      } catch {
        /* ignore */
      }
    }
    router.push(n.href || "/dashboard");
  };

  const markAll = async () => {
    setMarking(true);
    try {
      await markAllNotificationsRead();
      setItems((prev) =>
        prev.map((x) => ({ ...x, readAt: x.readAt ?? new Date().toISOString() }))
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("notif.error"));
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 820, mx: "auto" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            {t("notif.title")}
          </Typography>
          <Typography color="text.secondary">{t("notif.subtitle")}</Typography>
        </Box>
        <Button onClick={() => void markAll()} disabled={marking}>
          {t("notif.markAll")}
        </Button>
      </Stack>

      {items.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">{t("notif.empty")}</Typography>
        </Paper>
      ) : (
        <Stack spacing={1.25}>
          {items.map((n) => (
            <Paper
              key={n.id}
              variant="outlined"
              onClick={() => void open(n)}
              sx={{
                p: 2,
                cursor: "pointer",
                opacity: n.readAt ? 0.72 : 1,
                borderColor: n.readAt ? "divider" : "primary.main",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <Chip size="small" label={typeLabel(n.type)} color={TYPE_COLOR[n.type]} />
                <Typography variant="caption" color="text.secondary">
                  {new Date(n.createdAt).toLocaleString(locale === "en" ? "en-US" : "es-CO", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </Typography>
              </Stack>
              <Typography fontWeight={n.readAt ? 600 : 800}>{n.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {n.body}
              </Typography>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}

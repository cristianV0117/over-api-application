"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { usePreferences } from "@/context/preferencesContext";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  type AppNotification,
} from "@/lib/api/notifications";

function relativeWhen(iso: string, locale: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return locale === "en" ? "just now" : "ahora";
  if (min < 60) return locale === "en" ? `${min}m ago` : `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return locale === "en" ? `${h}h ago` : `hace ${h} h`;
  return d.toLocaleDateString(locale === "en" ? "en-US" : "es-CO", {
    day: "numeric",
    month: "short",
  });
}

export default function NotificationBell() {
  const router = useRouter();
  const { t, locale } = usePreferences();
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const refreshCount = useCallback(async () => {
    try {
      setCount(await fetchUnreadCount());
    } catch {
      /* silencioso: la campana no debe romper el layout */
    }
  }, []);

  useEffect(() => {
    void refreshCount();
    const id = window.setInterval(() => void refreshCount(), 45_000);
    return () => window.clearInterval(id);
  }, [refreshCount]);

  const open = async (el: HTMLElement) => {
    setAnchor(el);
    try {
      const list = await fetchNotifications({ limit: 8 });
      setItems(list);
    } catch {
      setItems([]);
    }
  };

  const go = async (n: AppNotification) => {
    if (!n.readAt) {
      try {
        await markNotificationRead(n.id);
        setCount((c) => Math.max(0, c - 1));
        setItems((prev) =>
          prev.map((x) =>
            x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x
          )
        );
      } catch {
        /* ignore */
      }
    }
    setAnchor(null);
    router.push(n.href || "/dashboard/notificaciones");
  };

  return (
    <>
      <IconButton
        color="inherit"
        aria-label={t("notif.bell")}
        onClick={(e) => void open(e.currentTarget)}
        sx={{ color: "text.secondary" }}
      >
        <Badge badgeContent={count} color="error" max={9}>
          <NotificationsNoneOutlinedIcon />
        </Badge>
      </IconButton>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { width: 360, maxWidth: "calc(100vw - 24px)" } } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.25 }}>
          <Typography fontWeight={700}>{t("notif.title")}</Typography>
          <Button
            size="small"
            onClick={() => {
              setAnchor(null);
              router.push("/dashboard/notificaciones");
            }}
          >
            {t("notif.seeAll")}
          </Button>
        </Stack>
        <Divider />
        {items.length === 0 ? (
          <Box sx={{ px: 2, py: 3 }}>
            <Typography color="text.secondary" variant="body2">
              {t("notif.empty")}
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {items.map((n) => (
              <ListItemButton key={n.id} onClick={() => void go(n)} alignItems="flex-start">
                <ListItemText
                  primary={n.title}
                  secondary={
                    <>
                      {n.body}
                      <Typography component="span" display="block" variant="caption" color="text.disabled">
                        {relativeWhen(n.createdAt, locale)}
                      </Typography>
                    </>
                  }
                  primaryTypographyProps={{
                    fontWeight: n.readAt ? 500 : 700,
                    noWrap: true,
                  }}
                  secondaryTypographyProps={{
                    sx: {
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}

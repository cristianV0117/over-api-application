"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SendIcon from "@mui/icons-material/Send";
import MarkdownBubble from "@/components/contabilidad/MarkdownBubble";
import { usePreferences } from "@/context/preferencesContext";
import {
  clearVehicleAssistantHistory,
  getVehicleAssistantHistory,
  sendVehicleAssistantChat,
  type Vehicle,
  type VehicleAssistantMessage,
} from "@/lib/api/vehicles";

const PROMPTS_ES = [
  "¿Qué le debo hacer ya a este vehículo?",
  "Con este kilometraje, ¿qué mantenimiento se venció?",
  "Revisá el manual y armame un plan de los próximos 3 servicios",
  "¿La cadena / aceite / frenos van bien o los cambio?",
];

const PROMPTS_EN = [
  "What should I do to this vehicle right now?",
  "With this mileage, which service is overdue?",
  "Read the manual and plan the next 3 services",
  "Are chain / oil / brakes ok or should I replace them?",
];

type Props = { vehicle: Vehicle };

export default function VehicleAssistantPanel({ vehicle }: Props) {
  const { t, locale } = usePreferences();
  const [messages, setMessages] = useState<VehicleAssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const prompts = locale === "en" ? PROMPTS_EN : PROMPTS_ES;

  useEffect(() => {
    setBooting(true);
    getVehicleAssistantHistory(vehicle.id)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setBooting(false));
  }, [vehicle.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text || loading) return;
    setLoading(true);
    setInput("");
    const optimistic: VehicleAssistantMessage = {
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      const res = await sendVehicleAssistantChat(vehicle.id, text);
      setMessages(res.messages);
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m !== optimistic));
      toast.error(e instanceof Error ? e.message : t("vehicle.ai.error"));
    } finally {
      setLoading(false);
    }
  };

  const wipe = async () => {
    if (!window.confirm(t("vehicle.ai.clearConfirm"))) return;
    try {
      await clearVehicleAssistantHistory(vehicle.id);
      setMessages([]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("vehicle.ai.error"));
    }
  };

  const km = vehicle.odometerKm;
  const years = vehicle.yearsOwned;
  const hasManual = Boolean(vehicle.documents.manual);

  return (
    <Paper sx={{ p: 2, mt: 2.5 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        sx={{ mb: 1 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <AutoAwesomeOutlinedIcon color="primary" fontSize="small" />
          <Typography fontWeight={800}>{t("vehicle.ai.title")}</Typography>
        </Stack>
        <IconButton
          size="small"
          onClick={() => void wipe()}
          aria-label={t("vehicle.ai.clear")}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {t("vehicle.ai.subtitle")}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
        <Chip
          size="small"
          color={km != null ? "success" : "warning"}
          variant="outlined"
          label={
            km != null
              ? t("vehicle.ai.kmChip", { km: km.toLocaleString(locale === "en" ? "en-US" : "es-CO") })
              : t("vehicle.ai.kmMissing")
          }
        />
        <Chip
          size="small"
          color={years != null ? "success" : "warning"}
          variant="outlined"
          label={
            years != null
              ? t("vehicle.ai.yearsChip", { n: years })
              : t("vehicle.ai.yearsMissing")
          }
        />
        <Chip
          size="small"
          color={hasManual ? "success" : "warning"}
          variant="outlined"
          label={hasManual ? t("vehicle.ai.manualOk") : t("vehicle.ai.manualMissing")}
        />
      </Stack>

      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mb: 1.5 }}>
        {prompts.map((p) => (
          <Chip
            key={p}
            size="small"
            label={p}
            onClick={() => void send(p)}
            disabled={loading}
            variant="outlined"
          />
        ))}
      </Stack>

      <Box
        sx={{
          maxHeight: 360,
          overflow: "auto",
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          p: 1.5,
          mb: 1.5,
          bgcolor: "action.hover",
        }}
      >
        {booting ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={22} />
          </Box>
        ) : messages.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t("vehicle.ai.empty")}
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {messages.map((m, i) => (
              <Box
                key={`${m.createdAt}-${i}`}
                sx={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "92%",
                  px: 1.25,
                  py: 1,
                  borderRadius: 2,
                  bgcolor:
                    m.role === "user" ? "primary.main" : "background.paper",
                  color:
                    m.role === "user" ? "primary.contrastText" : "text.primary",
                }}
              >
                {m.role === "assistant" ? (
                  <MarkdownBubble content={m.content} />
                ) : (
                  <Typography variant="body2">{m.content}</Typography>
                )}
              </Box>
            ))}
            {loading ? (
              <Typography variant="caption" color="text.secondary">
                {t("vehicle.ai.thinking")}
              </Typography>
            ) : null}
            <div ref={endRef} />
          </Stack>
        )}
      </Box>

      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          fullWidth
          placeholder={t("vehicle.ai.placeholder")}
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <Button
          variant="contained"
          disabled={loading || !input.trim()}
          onClick={() => void send()}
          startIcon={loading ? <CircularProgress size={14} /> : <SendIcon />}
        >
          {t("vehicle.ai.send")}
        </Button>
      </Stack>
    </Paper>
  );
}

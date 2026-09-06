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
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SendIcon from "@mui/icons-material/Send";
import {
  clearAssistantHistory,
  createFinanceDebt,
  formatCop,
  getAssistantHistory,
  sendAssistantChat,
  type AssistantMessage,
  type FinanceDebtWrite,
} from "@/lib/api/contabilidad";

const PROMPTS = [
  "¿Cómo voy este mes de ingresos y gastos?",
  "¿En qué categoría gasto más en los últimos 6 meses?",
  "Armame un plan de pago de mis deudas (avalancha)",
  "Si pago $200.000 extra al mes, ¿cuándo termino los créditos?",
];

type PendingFile = {
  fileName: string;
  mimeType: string;
  dataBase64: string;
  previewUrl?: string;
};

type Props = {
  year: number;
  month: number;
  monthLabel: string;
  onDebtCreated?: () => Promise<void> | void;
};

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,application/pdf,.pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx,application/vnd.ms-excel,.xls,text/csv,.csv,text/plain,.txt";

function inferMime(file: File): string {
  if (file.type && file.type !== "application/octet-stream") return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".xlsx"))
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (name.endsWith(".xls")) return "application/vnd.ms-excel";
  if (name.endsWith(".csv")) return "text/csv";
  if (name.endsWith(".txt")) return "text/plain";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".gif")) return "image/gif";
  return file.type;
}

function isAllowedAttachment(file: File): boolean {
  const mime = inferMime(file);
  return (
    mime.startsWith("image/") ||
    mime === "application/pdf" ||
    mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mime === "application/vnd.ms-excel" ||
    mime === "text/csv" ||
    mime === "application/csv" ||
    mime === "text/plain"
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

export default function FinanceAssistantPanel({
  year,
  month,
  monthLabel,
  onDebtCreated,
}: Props) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<PendingFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [savingDebt, setSavingDebt] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAssistantHistory()
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setBooting(false));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    if (!isAllowedAttachment(file)) {
      toast.error("Usá imagen, PDF, Excel (.xlsx) o CSV.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("El archivo no puede superar 8 MB");
      return;
    }
    const mimeType = inferMime(file);
    const dataBase64 = await fileToBase64(file);
    setPending({
      fileName: file.name,
      mimeType,
      dataBase64,
      previewUrl: mimeType.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined,
    });
  };

  const send = async (preset?: string) => {
    const text = (preset ?? input).trim();
    if ((!text && !pending) || loading) return;
    setLoading(true);
    setInput("");
    const optimistic: AssistantMessage = {
      role: "user",
      content: text || "Analizá el documento adjunto.",
      attachmentName: pending?.fileName,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      const res = await sendAssistantChat({
        message: optimistic.content,
        year,
        month,
        attachment: pending
          ? {
              mimeType: pending.mimeType,
              dataBase64: pending.dataBase64,
              fileName: pending.fileName,
            }
          : undefined,
      });
      setMessages(res.messages);
      setPending(null);
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m !== optimistic));
      toast.error(e instanceof Error ? e.message : "Error del asistente");
    } finally {
      setLoading(false);
    }
  };

  const saveExtracted = async (debt: Partial<FinanceDebtWrite>) => {
    if (!debt.balance || !debt.installmentAmount || !debt.name) {
      toast.error("Faltan datos para guardar la deuda");
      return;
    }
    setSavingDebt(true);
    try {
      await createFinanceDebt({
        name: debt.name,
        creditor: debt.creditor,
        balance: Number(debt.balance),
        principal: debt.principal != null ? Number(debt.principal) : undefined,
        interestRate: Number(debt.interestRate ?? 0),
        interestRateType: debt.interestRateType === "EA" ? "EA" : "NM",
        installmentAmount: Number(debt.installmentAmount),
        dayOfMonth: Number(debt.dayOfMonth ?? 1) || 1,
        totalInstallments: debt.totalInstallments ?? null,
        paidInstallments: debt.paidInstallments ?? 0,
        notes: debt.notes,
        isActive: true,
      });
      toast.success("Deuda guardada. Ya la puede usar el asistente.");
      await onDebtCreated?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setSavingDebt(false);
    }
  };

  const wipe = async () => {
    if (!confirm("¿Borrar el historial del asistente?")) return;
    try {
      await clearAssistantHistory();
      setMessages([]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo borrar");
    }
  };

  return (
    <Paper
      sx={{
        p: { xs: 1.5, md: 2 },
        width: "100%",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        minHeight: { xs: "70vh", md: "min(72vh, 760px)" },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        gap={1}
        sx={{ mb: 1.5 }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Asistente de finanzas
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Usa tus movimientos de {monthLabel} {year}, recurrentes y deudas.
            Podés adjuntar pantallazo, PDF o Excel de un crédito. Orientación,
            no asesoría formal.
          </Typography>
        </Box>
        <Button
          size="small"
          color="inherit"
          startIcon={<DeleteOutlineIcon />}
          onClick={wipe}
          disabled={messages.length === 0}
        >
          Limpiar
        </Button>
      </Stack>

      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
        {PROMPTS.map((p) => (
          <Chip
            key={p}
            label={p}
            size="small"
            onClick={() => send(p)}
            disabled={loading}
            variant="outlined"
          />
        ))}
      </Stack>

      <Box
        sx={{
          flex: 1,
          minHeight: 280,
          overflowY: "auto",
          pr: 0.5,
          mb: 1.5,
        }}
      >
        {booting ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress size={28} />
          </Stack>
        ) : messages.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
            Preguntá cómo vas este mes, en qué gastás más, o adjuntá un
            pantallazo, PDF o Excel de un crédito.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {messages.map((m, i) => (
              <Box
                key={`${m.createdAt}-${i}`}
                sx={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: { xs: "94%", md: "80%" },
                }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    bgcolor:
                      m.role === "user"
                        ? "rgba(124, 58, 237, 0.16)"
                        : "action.hover",
                    borderColor: m.role === "user" ? "primary.main" : "divider",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {m.content}
                  </Typography>
                  {m.attachmentName ? (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mt: 0.75 }}
                    >
                      Adjunto: {m.attachmentName}
                    </Typography>
                  ) : null}
                  {m.role === "assistant" && m.extractedDebt ? (
                    <Box sx={{ mt: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Extraído del documento. Confirmá para guardarlo.
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ mt: 0.5 }}
                      >
                        {m.extractedDebt.name} ·{" "}
                        {formatCop(Number(m.extractedDebt.balance ?? 0))}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Cuota{" "}
                        {formatCop(
                          Number(m.extractedDebt.installmentAmount ?? 0)
                        )}{" "}
                        · {m.extractedDebt.interestRate}%{" "}
                        {m.extractedDebt.interestRateType}
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        sx={{ mt: 1 }}
                        disabled={savingDebt}
                        onClick={() => saveExtracted(m.extractedDebt!)}
                      >
                        Guardar como deuda
                      </Button>
                    </Box>
                  ) : null}
                </Paper>
              </Box>
            ))}
            {loading ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">
                  Analizando…
                </Typography>
              </Stack>
            ) : null}
            <div ref={endRef} />
          </Stack>
        )}
      </Box>

      {pending ? (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            mb: 1,
            p: 1,
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          {pending.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pending.previewUrl}
              alt=""
              style={{
                width: 48,
                height: 48,
                objectFit: "cover",
                borderRadius: 6,
              }}
            />
          ) : null}
          <Typography variant="caption" sx={{ flex: 1 }} noWrap>
            {pending.fileName}
          </Typography>
          <IconButton
            size="small"
            aria-label="Quitar adjunto"
            onClick={() => setPending(null)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      ) : null}

      <Stack
        component="form"
        direction="row"
        spacing={1}
        alignItems="flex-end"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={(e) => {
            void pickFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <IconButton
          aria-label="Adjuntar documento"
          onClick={() => fileRef.current?.click()}
          disabled={loading}
        >
          <AttachFileIcon />
        </IconButton>
        <TextField
          fullWidth
          size="small"
          placeholder="Preguntá o adjuntá PDF, Excel o un pantallazo…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          multiline
          maxRows={4}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={loading || (!input.trim() && !pending)}
          aria-label="Enviar"
        >
          <SendIcon />
        </IconButton>
      </Stack>
    </Paper>
  );
}

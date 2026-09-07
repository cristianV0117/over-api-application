"use client";

import { useState, useRef, useEffect } from "react";
import NextLink from "next/link";
import { createTask, type Task } from "@/lib/api/tasks";
import { parseCreateTaskIntent } from "@/lib/chat/parseCreateTask";
import {
  createFinanceDebt,
  formatCop,
  sendAssistantChat,
  type FinanceDebtWrite,
} from "@/lib/api/contabilidad";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Fab from "@mui/material/Fab";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Fade from "@mui/material/Fade";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";

type MessageRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  taskCreated?: Task;
  extractedDebt?: Partial<FinanceDebtWrite> | null;
};

const BOT_NAME = "Asistente";
const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: `Hola. Puedo registrar gastos, ingresos y créditos, y también crear tareas.\n\n• "Hoy gasté 1000 en una paleta"\n• Adjuntá un pantallazo del crédito y pedí que lo registre\n• "Crea una tarea: Revisar PRs"`,
};

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

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<
    { fileName: string; mimeType: string; dataBase64: string }[]
  >([]);
  const [savingDebt, setSavingDebt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open]);

  const pickFiles = async (list: FileList | null) => {
    const files = list ? [...list].slice(0, 3) : [];
    const next: { fileName: string; mimeType: string; dataBase64: string }[] =
      [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) continue;
      next.push({
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        dataBase64: await fileToBase64(file),
      });
    }
    if (next.length) setPending((prev) => [...prev, ...next].slice(0, 3));
  };

  const saveDebt = async (debt: Partial<FinanceDebtWrite>) => {
    if (!debt.balance || !debt.installmentAmount || !debt.name) return;
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
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "Crédito guardado. Lo ves en la pestaña Crédito.",
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: e instanceof Error ? e.message : "No se pudo guardar",
        },
      ]);
    } finally {
      setSavingDebt(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if ((!text && pending.length === 0) || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const intent = pending.length === 0 ? parseCreateTaskIntent(text) : null;

    if (intent) {
      try {
        const task = await createTask({
          title: intent.title,
          description: intent.description,
        });
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: `Tarea creada: **${task.title}**${task.description ? `\nDescripción: ${task.description}` : ""}`,
          taskCreated: task,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: `No pude crear la tarea: ${err instanceof Error ? err.message : "Error desconocido"}`,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } else {
      try {
        const now = new Date();
        const res = await sendAssistantChat({
          message: text || "Analizá el documento adjunto y registrá lo que corresponda.",
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          attachments: pending,
        });
        const extra = res.applied
          ? "\n\nQuedó registrado en tu contabilidad / créditos."
          : "";
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: (res.reply || "Listo.") + extra,
            extractedDebt: res.extractedDebt,
          },
        ]);
        setPending([]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: `No pude procesarlo: ${
              err instanceof Error ? err.message : "Error desconocido"
            }`,
          },
        ]);
      }
    }

    setLoading(false);
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label={open ? "Cerrar asistente" : "Abrir asistente"}
        onClick={() => setOpen((o) => !o)}
        sx={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: (t) => t.zIndex.drawer + 2,
          px: 2,
          gap: 1,
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(124, 58, 237, 0.35)",
        }}
        variant="extended"
      >
        <ChatIcon />
        Asistente
      </Fab>

      <Fade in={open}>
        <Box
          sx={{
            display: open ? "block" : "none",
            position: "fixed",
            inset: 0,
            zIndex: (t) => t.zIndex.drawer + 1,
            pointerEvents: open ? "auto" : "none",
          }}
        >
          <Box
            role="presentation"
            onClick={() => setOpen(false)}
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(2px)",
            }}
          />
          <Paper
            elevation={12}
            sx={{
              position: "fixed",
              right: 24,
              bottom: 96,
              width: "min(420px, calc(100vw - 48px))",
              height: "min(520px, calc(100vh - 120px))",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              border: 1,
              borderColor: "divider",
              zIndex: 2,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: 1,
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                <ChatIcon sx={{ mr: 1, verticalAlign: "text-bottom", fontSize: 20 }} />
                {BOT_NAME}
              </Typography>
              <IconButton size="small" onClick={() => setOpen(false)} aria-label="Cerrar">
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ flex: 1, overflow: "auto", p: 2, minHeight: 0 }}>
              {messages.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "85%",
                      px: 2,
                      py: 1.25,
                      borderRadius: 3,
                      bgcolor:
                        msg.role === "user"
                          ? "primary.main"
                          : "action.hover",
                      color: msg.role === "user" ? "primary.contrastText" : "text.primary",
                    }}
                  >
                    {msg.role === "assistant" && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        {BOT_NAME}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {msg.content.split("**").map((part, i) =>
                        i % 2 === 1 ? (
                          <strong key={i}>{part}</strong>
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      )}
                    </Typography>
                    {msg.extractedDebt ? (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" display="block">
                          {msg.extractedDebt.name} ·{" "}
                          {formatCop(Number(msg.extractedDebt.balance ?? 0))}
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          sx={{ mt: 0.75 }}
                          disabled={savingDebt}
                          onClick={() => void saveDebt(msg.extractedDebt!)}
                        >
                          Guardar crédito
                        </Button>
                      </Box>
                    ) : null}
                    {msg.taskCreated && (
                      <Link
                        component={NextLink}
                        href="/dashboard/tasks"
                        color="inherit"
                        underline="always"
                        sx={{ display: "inline-block", mt: 1, fontSize: "0.8rem", opacity: 0.9 }}
                        onClick={() => setOpen(false)}
                      >
                        Ver tareas →
                      </Link>
                    )}
                  </Box>
                </Box>
              ))}
              {loading && (
                <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
                  <Box sx={{ px: 2, py: 1, borderRadius: 3, bgcolor: "action.hover" }}>
                    <Typography variant="caption" color="text.secondary">
                      Pensando…
                    </Typography>
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, borderTop: 1, borderColor: "divider", bgcolor: "action.hover" }}>
              {pending.length > 0 ? (
                <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                  Adjunto: {pending.map((p) => p.fileName).join(" · ")}
                </Typography>
              ) : null}
              <input
                ref={fileRef}
                type="file"
                hidden
                accept="image/*,application/pdf,.pdf"
                multiple
                onChange={(e) => {
                  void pickFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  aria-label="Adjuntar"
                  onClick={() => fileRef.current?.click()}
                  disabled={loading}
                >
                  <AttachFileIcon />
                </IconButton>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Gasté… o adjuntá el crédito"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  aria-label="Mensaje"
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || (!input.trim() && pending.length === 0)}
                  sx={{ minWidth: 48, px: 1.5 }}
                  aria-label="Enviar"
                >
                  <SendIcon fontSize="small" />
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Fade>
    </>
  );
}

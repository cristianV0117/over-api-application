"use client";

import { useState, useRef, useEffect } from "react";
import { createTask, type Task } from "@/lib/api/tasks";
import { parseCreateTaskIntent } from "@/lib/chat/parseCreateTask";

type MessageRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  taskCreated?: Task;
};

const BOT_NAME = "Asistente";
const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: `Hola. Puedo ayudarte a crear tareas. Escribe por ejemplo:\n\n• "Crea una tarea: Revisar PRs"\n• "Crear tarea Llamar al cliente. Seguimiento de venta"`,
};

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const intent = parseCreateTaskIntent(text);

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
      const noIntentMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: 'No entendí. Puedes pedirme crear una tarea, por ejemplo: "Crea una tarea: Revisar PRs"',
      };
      setMessages((prev) => [...prev, noIntentMessage]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="border-0 rounded-3 shadow d-flex align-items-center gap-2 px-3 py-2 text-white"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          backgroundColor: "#702CF4",
          zIndex: 1040,
        }}
        aria-label={open ? "Cerrar asistente" : "Abrir asistente"}
      >
        <i className="bi bi-chat-dots-fill" />
        <span>Asistente</span>
      </button>

      {/* Panel tipo modal */}
      {open && (
        <>
          <div
            role="button"
            tabIndex={0}
            className="border-0"
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              zIndex: 1041,
            }}
            onClick={() => setOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            aria-label="Cerrar"
          />
          <div
            className="rounded-3 shadow-lg d-flex flex-column text-white overflow-hidden"
            style={{
              position: "fixed",
              bottom: "80px",
              right: "24px",
              width: "min(420px, calc(100vw - 48px))",
              height: "min(520px, calc(100vh - 120px))",
              backgroundColor: "#1B1F22",
              zIndex: 1042,
            }}
          >
            <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom border-secondary">
              <span className="fw-semibold">
                <i className="bi bi-chat-dots me-2" />
                {BOT_NAME}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-link text-white p-0"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="p-3 overflow-auto flex-grow-1" style={{ minHeight: 0 }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`d-flex mb-3 ${msg.role === "user" ? "justify-content-end" : "justify-content-start"}`}
                >
                  <div
                    className="rounded-3 px-3 py-2 shadow-sm"
                    style={{
                      maxWidth: "85%",
                      backgroundColor:
                        msg.role === "user"
                          ? "#702CF4"
                          : "rgba(255,255,255,0.08)",
                    }}
                  >
                    {msg.role === "assistant" && (
                      <span className="small text-secondary d-block mb-1">
                        {BOT_NAME}
                      </span>
                    )}
                    <div style={{ whiteSpace: "pre-wrap" }}>
                      {msg.content.split("**").map((part, i) =>
                        i % 2 === 1 ? (
                          <strong key={i}>{part}</strong>
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      )}
                    </div>
                    {msg.taskCreated && (
                      <a
                        href="/dashboard/tasks"
                        className="small mt-2 d-inline-block"
                        style={{ color: "#702CF4" }}
                        onClick={() => setOpen(false)}
                      >
                        Ver tareas →
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="d-flex justify-content-start mb-3">
                  <div
                    className="rounded-3 px-3 py-2"
                    style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                  >
                    <span className="small text-secondary">Pensando...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-3 border-top border-secondary"
              style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
            >
              <div className="input-group input-group-sm">
                <input
                  type="text"
                  className="form-control bg-dark text-white border-secondary"
                  placeholder="Crea una tarea: ..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  aria-label="Mensaje"
                />
                <button
                  type="submit"
                  className="btn btn-sm"
                  style={{ backgroundColor: "#702CF4", color: "white" }}
                  disabled={loading || !input.trim()}
                  aria-label="Enviar"
                >
                  <i className="bi bi-send-fill" />
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}

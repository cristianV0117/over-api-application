"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ForgotPasswordModalProps {
  show: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({
  show,
  onClose,
}: ForgotPasswordModalProps) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (show) {
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/email/forgot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, name: "Usuario" }), // si no tienes nombre real
        }
      );

      if (!res.ok) throw new Error("Error al enviar el correo");

      toast.info("¡Se ha envíado un mensaje a tu correo electronico!");

      setMessage("¡Correo enviado correctamente!");
      setEmail("");
      onClose();
    } catch (err) {
      setMessage("Hubo un error al enviar el correo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!show && !visible) return null;

  return (
    <div
      className={`modal fade ${show ? "d-block" : "d-none"} ${visible ? "show" : ""}`}
      tabIndex={-1}
      role="dialog"
      style={{
        backgroundColor: "rgba(0,0,0,0.7)",
        transition: "opacity 0.3s ease",
      }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content bg-dark text-white">
          <div className="modal-header">
            <h5 className="modal-title">Recuperar contraseña</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="forgotEmail" className="form-label">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="forgotEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control bg-secondary text-white border-0"
                  placeholder="usuario@correo.com"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn w-100"
                style={{ backgroundColor: "#702CF4", color: "white" }}
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar enlace"}
              </button>
              {message && (
                <p className="mt-3 text-center small text-warning">{message}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

interface ForgotPasswordModalProps {
  show: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({
  show,
  onClose,
}: ForgotPasswordModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      // inicia animación de entrada
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false); // oculta inmediatamente
    }
  }, [show]);

  if (!show && !visible) return null; // ni renderiza

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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                console.log("Enviando enlace de recuperación...");
                onClose();
              }}
            >
              <div className="mb-3">
                <label htmlFor="forgotEmail" className="form-label">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="forgotEmail"
                  className="form-control bg-secondary text-white border-0"
                  placeholder="usuario@correo.com"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn w-100"
                style={{ backgroundColor: "#702CF4", color: "white" }}
              >
                Enviar enlace
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import ForgotPasswordModal from "@/components/login/ForgotPasswordModal";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Inicio de sesión exitoso");
    toast.error("Credenciales incorrectas");
    toast.info("Cargando datos...");
    console.log({ email, password });
  };

  const handleGoogleLogin = () => {
    toast.info("Iniciando sesión con Google...");
  };

  return (
    <>
      <div className="card col-md-6 p-4" style={{ backgroundColor: "#1B1F22" }}>
        <form onSubmit={handleSubmit}>
          <h2 className="mb-4 text-white text-center d-flex align-items-center justify-content-center gap-2">
            <i className="bi bi-box-arrow-in-right"></i>
            Iniciar sesión
          </h2>

          <div className="mb-3">
            <label htmlFor="email" className="form-label text-white">
              Correo electrónico
            </label>
            <input
              type="email"
              className="form-control bg-dark text-white border-0"
              id="email"
              placeholder="usuario@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-2">
            <label htmlFor="password" className="form-label text-white">
              Contraseña
            </label>
            <input
              type="password"
              className="form-control bg-dark text-white border-0"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="text-end mb-3">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="btn btn-link p-0"
              style={{ color: "#702CF4" }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            className="btn w-100 mb-3"
            style={{ backgroundColor: "#702CF4", color: "white" }}
          >
            Ingresar
          </button>

          <div className="text-center text-white mb-3">o</div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <i className="bi bi-google"></i> Iniciar sesión con Google
          </button>

          <div className="text-center mt-4">
            <span className="text-white">¿No tienes cuenta? </span>
            <a
              href="#"
              className="text-decoration-none"
              style={{ color: "#702CF4" }}
            >
              Regístrate
            </a>
          </div>
        </form>
      </div>

      <ForgotPasswordModal
        show={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </>
  );
}

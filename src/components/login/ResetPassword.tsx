"use client";

import { useState } from "react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    // Aquí iría la llamada a tu backend con el token
    console.log("Nueva contraseña:", password);
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-white">
      <div
        className="card p-4"
        style={{ backgroundColor: "#1B1F22", width: "100%", maxWidth: "420px" }}
      >
        <h2 className="text-center mb-4" style={{ color: "#A259FF" }}>
          Restablecer contraseña
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Nueva contraseña
            </label>
            <input
              type="password"
              id="password"
              className="form-control bg-secondary text-white border-0"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="form-control bg-secondary text-white border-0"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="btn w-100"
            style={{ backgroundColor: "#702CF4", color: "#fff" }}
          >
            Guardar nueva contraseña
          </button>
        </form>
      </div>
    </div>
  );
}

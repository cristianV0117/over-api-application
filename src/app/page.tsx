"use client";

import LoginForm from "@/components/login/LoginForm";

export default function Home() {
  return (
    <div
      style={{ paddingBottom: "80px" }}
      className="container d-flex flex-column justify-content-center align-items-center vh-100"
    >
      <h1 className="gradient-title d-flex align-items-center gap-2">
        <i className="bi bi-check2-circle"></i> OVER APP
      </h1>
      <LoginForm />
    </div>
  );
}

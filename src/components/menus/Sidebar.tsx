"use client";

import Link from "next/link";
import { useUser } from "@/context/userContext";
import { avatarUrl } from "@/lib/api/profile";

export default function Sidebar() {
  const user = useUser();

  return (
    <div
      className="d-flex flex-column flex-shrink-0 p-3 text-white"
      style={{ width: "250px", backgroundColor: "#1B1F22", minHeight: "100vh" }}
    >
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <Link href="/dashboard/users" className="nav-link text-white">
            <i className="bi bi-house-door me-2"></i>Usuarios
          </Link>
        </li>
        <li>
          <Link href="/dashboard/tasks" className="nav-link text-white">
            <i className="bi bi-kanban me-2"></i>Tareas
          </Link>
        </li>
        <li>
          <Link href="/dashboard/profile" className="nav-link text-white">
            <i className="bi bi-person me-2"></i>Perfil
          </Link>
        </li>
        <li>
          <Link href="#" className="nav-link text-white">
            <i className="bi bi-gear me-2"></i>Configuración
          </Link>
        </li>
      </ul>
      <hr />
      <div className="dropdown">
        <Link
          href="#"
          className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
          data-bs-toggle="dropdown"
        >
          <img
            src={avatarUrl(user?.avatarUrl)}
            alt="avatar"
            className="rounded-circle me-2"
            style={{ width: 32, height: 32, objectFit: "cover" }}
          />
          <strong>{user?.name ?? "Usuario"}</strong>
        </Link>
        <ul className="dropdown-menu dropdown-menu-dark text-small shadow">
          <li>
            <Link href="/dashboard/profile" className="dropdown-item">
              Perfil
            </Link>
          </li>
          <li>
            <a className="dropdown-item" href="#">
              Cerrar sesión
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

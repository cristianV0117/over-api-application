"use client";

import Link from "next/link";

export default function Sidebar() {
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
          <Link href="#" className="nav-link text-white">
            <i className="bi bi-gear me-2"></i>Configuración
          </Link>
        </li>
      </ul>
      <hr />
      <div className="dropdown">
        <a
          href="#"
          className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
          data-bs-toggle="dropdown"
        >
          <img
            src="https://via.placeholder.com/32"
            alt="avatar"
            className="rounded-circle me-2"
          />
          <strong>Usuario</strong>
        </a>
        <ul className="dropdown-menu dropdown-menu-dark text-small shadow">
          <li>
            <a className="dropdown-item" href="#">
              Perfil
            </a>
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

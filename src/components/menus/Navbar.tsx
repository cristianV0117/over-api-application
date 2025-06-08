"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("¡Hasta pronto!");
    setTimeout(() => {
      router.push("/");
    }, 900);
  };

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{ backgroundColor: "#1B1F22" }}
    >
      <div className="container-fluid">
        <a className="navbar-brand text-white fw-bold ms-4" href="/dashboard">
          <i className="bi bi-stack me-2" style={{ color: "#702CF4" }}></i>OVER
          APP
        </a>

        <button
          className="navbar-toggler text-white border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link text-white" href="#">
                Inicio
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href="#">
                Funciones
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href="#">
                Contacto
              </a>
            </li>
            <li className="nav-item">
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-sm custom-button"
              >
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

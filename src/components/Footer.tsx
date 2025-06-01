"use client";

import { useEffect, useState } from "react";

export default function Footer() {
  const [year, setYear] = useState("");

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  return (
    <footer className="bg-body-secondary text-center text-body py-4 mt-auto w-100 border-top">
      <div className="container">
        <p className="mb-1">
          &copy; {year} Tu Empresa. Todos los derechos reservados.
        </p>
        <small>
          Desarrollado por{" "}
          <a
            href="https://tusitio.com"
            className="text-decoration-none link-primary"
          >
            TuNombre
          </a>
        </small>
      </div>
    </footer>
  );
}

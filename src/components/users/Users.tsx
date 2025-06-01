"use client";

import { useEffect, useRef } from "react";

export default function Users() {
  const tableRef = useRef<HTMLTableElement>(null);

  const users = [
    {
      id: 1,
      nombre: "Juan Pérez",
      correo: "juan@example.com",
      rol: "Administrador",
    },
    {
      id: 2,
      nombre: "María Gómez",
      correo: "maria@example.com",
      rol: "Editor",
    },
    {
      id: 3,
      nombre: "Carlos Ruiz",
      correo: "carlos@example.com",
      rol: "Lector",
    },
    { id: 4, nombre: "Ana López", correo: "ana@example.com", rol: "Moderador" },
    { id: 5, nombre: "Luis Torres", correo: "luis@example.com", rol: "Editor" },
    {
      id: 6,
      nombre: "Pedro Sánchez",
      correo: "pedro@example.com",
      rol: "Editor",
    },
    {
      id: 7,
      nombre: "Lucía Romero",
      correo: "lucia@example.com",
      rol: "Lector",
    },
    {
      id: 8,
      nombre: "Jorge Vargas",
      correo: "jorge@example.com",
      rol: "Administrador",
    },
    {
      id: 9,
      nombre: "Marta Díaz",
      correo: "marta@example.com",
      rol: "Moderador",
    },
    {
      id: 10,
      nombre: "Sofía López",
      correo: "sofia@example.com",
      rol: "Editor",
    },
    {
      id: 11,
      nombre: "Sofía López",
      correo: "sofia@example.com",
      rol: "Editor",
    },
    {
      id: 12,
      nombre: "Sofía López",
      correo: "sofia@example.com",
      rol: "Editor",
    },
    {
      id: 13,
      nombre: "Sofía López",
      correo: "sofia@example.com",
      rol: "Editor",
    },
  ];

  useEffect(() => {
    const loadDataTable = async () => {
      await import("@/lib/datatables");

      if (tableRef.current && !$.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable({
          language: {
            url: "/datatables/i18n/es-ES.json",
          },
        });
      }
    };

    loadDataTable();
  }, []);

  return (
    <div className="text-white p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-4 m-0">Usuarios</h1>
        <button className="btn custom-button">
          <i className="bi bi-person-plus-fill me-2"></i>Crear usuario
        </button>
      </div>

      <div className="table-responsive">
        <table
          ref={tableRef}
          className="table table-dark table-bordered table-hover align-middle"
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>{usuario.nombre}</td>
                <td>{usuario.correo}</td>
                <td>{usuario.rol}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-light me-2"
                    title="Editar"
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    title="Desactivar"
                  >
                    <i className="bi bi-person-x"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

type UserRow = {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
};

const MOCK_USERS: UserRow[] = [
  { id: 1, nombre: "Juan Pérez", correo: "juan@example.com", rol: "Administrador" },
  { id: 2, nombre: "María Gómez", correo: "maria@example.com", rol: "Editor" },
  { id: 3, nombre: "Carlos Ruiz", correo: "carlos@example.com", rol: "Lector" },
  { id: 4, nombre: "Ana López", correo: "ana@example.com", rol: "Moderador" },
  { id: 5, nombre: "Luis Torres", correo: "luis@example.com", rol: "Editor" },
  { id: 6, nombre: "Pedro Sánchez", correo: "pedro@example.com", rol: "Editor" },
  { id: 7, nombre: "Lucía Romero", correo: "lucia@example.com", rol: "Lector" },
  { id: 8, nombre: "Jorge Vargas", correo: "jorge@example.com", rol: "Administrador" },
  { id: 9, nombre: "Marta Díaz", correo: "marta@example.com", rol: "Moderador" },
  { id: 10, nombre: "Sofía López", correo: "sofia@example.com", rol: "Editor" },
  { id: 11, nombre: "Diego Mora", correo: "diego@example.com", rol: "Lector" },
  { id: 12, nombre: "Elena Ríos", correo: "elena@example.com", rol: "Editor" },
  { id: 13, nombre: "Pablo Soto", correo: "pablo@example.com", rol: "Moderador" },
];

export default function Users() {
  const columns: GridColDef<UserRow>[] = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 72, type: "number" },
      { field: "nombre", headerName: "Nombre", flex: 1, minWidth: 160 },
      { field: "correo", headerName: "Correo", flex: 1.2, minWidth: 200 },
      {
        field: "rol",
        headerName: "Rol",
        width: 140,
        renderCell: (params) => (
          <Chip label={params.value} size="small" variant="outlined" color="primary" />
        ),
      },
      {
        field: "acciones",
        headerName: "Acciones",
        sortable: false,
        filterable: false,
        width: 120,
        renderCell: () => (
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" color="inherit" aria-label="Editar">
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" aria-label="Eliminar">
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
        ),
      },
    ],
    []
  );

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        gap={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Usuarios
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestiona el equipo y los permisos desde un solo lugar.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} sx={{ alignSelf: { sm: "center" } }}>
          Crear usuario
        </Button>
      </Stack>

      <Box
        sx={{
          height: 560,
          width: "100%",
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: "action.hover",
            borderBottom: 1,
            borderColor: "divider",
          },
          "& .MuiDataGrid-cell:focus-within": { outline: "none" },
        }}
      >
        <DataGrid
          rows={MOCK_USERS}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
        />
      </Box>
    </Box>
  );
}

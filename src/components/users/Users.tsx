"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useUser, useSetUser } from "@/context/userContext";
import { adminImpersonate, listAdminUsers, type AdminUserRow } from "@/lib/api/adminUsers";
import { toast } from "react-toastify";

function roleLabel(role: string) {
  return role === "admin" ? "Administrador" : "Usuario";
}

export default function Users() {
  const router = useRouter();
  const ctxUser = useUser();
  const setUser = useSetUser();
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const handleImpersonate = useCallback(
    async (row: AdminUserRow) => {
      if (row.role === "admin") return;
      if (
        !confirm(
          `¿Ver la aplicación como «${row.name}» (${row.email})?\n\n` +
            "Podrás reproducir bugs con los mismos permisos que ese usuario. " +
            "Usa solo cuando sea necesario y con consentimiento si aplica."
        )
      ) {
        return;
      }
      try {
        const { token } = await adminImpersonate(row.id);
        localStorage.setItem("token", token);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("No se pudo cargar el perfil del usuario");
        const data = await res.json();
        setUser(data);
        toast.success(`Modo infiltración: ${row.name}`);
        router.push("/dashboard");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error al infiltrarse");
      }
    },
    [router, setUser]
  );

  useEffect(() => {
    if (!ctxUser) return;
    if (ctxUser.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    (async () => {
      try {
        setRows(await listAdminUsers());
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error al cargar usuarios");
      } finally {
        setLoading(false);
      }
    })();
  }, [ctxUser, router]);

  const columns: GridColDef<AdminUserRow>[] = useMemo(
    () => [
      { field: "name", headerName: "Nombre", flex: 1, minWidth: 160 },
      { field: "email", headerName: "Correo", flex: 1.2, minWidth: 200 },
      {
        field: "role",
        headerName: "Rol",
        width: 160,
        renderCell: (params) => (
          <Chip
            label={roleLabel(params.value as string)}
            size="small"
            variant="outlined"
            color={params.value === "admin" ? "secondary" : "default"}
          />
        ),
      },
      {
        field: "impersonate",
        headerName: "Infiltrarse",
        width: 110,
        sortable: false,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => {
          const row = params.row;
          if (row.role === "admin") {
            return (
              <Typography variant="caption" color="text.secondary">
                —
              </Typography>
            );
          }
          return (
            <Tooltip title="Ver la app como este usuario (debug / soporte)">
              <IconButton
                size="small"
                color="secondary"
                aria-label={`Infiltrarse como ${row.name}`}
                onClick={() => handleImpersonate(row)}
              >
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          );
        },
      },
    ],
    [handleImpersonate]
  );

  if (!ctxUser) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (ctxUser.role !== "admin") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

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
            Listado de cuentas registradas en la aplicación (solo administradores).
          </Typography>
        </Box>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
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
            rows={rows}
            columns={columns}
            getRowId={(r) => r.id}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            localeText={esES.components.MuiDataGrid.defaultProps.localeText}
          />
        </Box>
      )}
    </Box>
  );
}

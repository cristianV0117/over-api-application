"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import { useUser } from "@/context/userContext";
import { listAdminUsers, type AdminUserRow } from "@/lib/api/adminUsers";
import { toast } from "react-toastify";

function roleLabel(role: string) {
  return role === "admin" ? "Administrador" : "Usuario";
}

export default function Users() {
  const router = useRouter();
  const ctxUser = useUser();
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);

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
    ],
    []
  );

  if (!ctxUser || ctxUser.role !== "admin") {
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

"use client";

import NextLink from "next/link";
import { useUser } from "@/context/userContext";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

export default function DashboardPage() {
  const user = useUser();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Hola, {user?.name?.split(" ")[0] ?? "equipo"}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 640 }}>
        Este es tu panel. El acceso rápido te lleva a usuarios, tareas y tu perfil.
        <Box component="span" sx={{ display: "block", mt: 0.5, opacity: 0.9 }}>
          {user?.email}
        </Box>
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} useFlexGap flexWrap="wrap">
        <Card variant="outlined" sx={{ flex: "1 1 260px", maxWidth: 360 }}>
          <CardContent>
            <PeopleOutlineIcon color="primary" sx={{ mb: 1 }} />
            <Typography variant="h6" fontWeight={700}>
              Usuarios
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Roles, permisos y alta de miembros.
            </Typography>
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button component={NextLink} href="/dashboard/users" variant="contained" size="small">
              Ir a usuarios
            </Button>
          </CardActions>
        </Card>
        <Card variant="outlined" sx={{ flex: "1 1 260px", maxWidth: 360 }}>
          <CardContent>
            <ViewKanbanOutlinedIcon color="primary" sx={{ mb: 1 }} />
            <Typography variant="h6" fontWeight={700}>
              Tareas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tablero Kanban y prioridades.
            </Typography>
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button component={NextLink} href="/dashboard/tasks" variant="contained" size="small">
              Ir a tareas
            </Button>
          </CardActions>
        </Card>
        <Card variant="outlined" sx={{ flex: "1 1 260px", maxWidth: 360 }}>
          <CardContent>
            <PersonOutlineIcon color="primary" sx={{ mb: 1 }} />
            <Typography variant="h6" fontWeight={700}>
              Perfil
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nombre y foto de perfil.
            </Typography>
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button component={NextLink} href="/dashboard/profile" variant="outlined" size="small">
              Editar perfil
            </Button>
          </CardActions>
        </Card>
      </Stack>
    </Box>
  );
}

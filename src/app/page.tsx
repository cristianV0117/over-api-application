"use client";

import LoginForm from "@/components/login/LoginForm";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 6,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(124, 58, 237, 0.35), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(56, 189, 248, 0.08), transparent)",
          pointerEvents: "none",
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1, textAlign: "center", mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} flexWrap="wrap" useFlexGap>
          <TaskAltIcon sx={{ fontSize: { xs: 48, sm: 56 }, color: "primary.main" }} />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.03em",
              fontSize: { xs: "2.25rem", sm: "3.25rem" },
              background: "linear-gradient(90deg, #a78bfa, #7c3aed, #c4b5fd)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            OVER APP
          </Typography>
        </Stack>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1, maxWidth: 420, mx: "auto" }}>
          Tareas y equipo en un solo lugar. Inicia sesión para continuar.
        </Typography>
      </Box>
      <Box sx={{ position: "relative", zIndex: 1, width: "100%", display: "flex", justifyContent: "center" }}>
        <LoginForm />
      </Box>
    </Box>
  );
}

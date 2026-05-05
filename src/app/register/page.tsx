"use client";

import RegisterForm from "@/components/login/RegisterForm";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { useRedirectIfAuthed } from "@/hooks/useRedirectIfAuthed";

export default function RegisterPage() {
  const ready = useRedirectIfAuthed();

  if (!ready) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

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
          Crea tu cuenta y empieza a organizar tareas con tu equipo.
        </Typography>
      </Box>
      <Box sx={{ position: "relative", zIndex: 1, width: "100%", display: "flex", justifyContent: "center" }}>
        <RegisterForm />
      </Box>
    </Box>
  );
}

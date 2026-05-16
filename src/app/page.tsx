"use client";

import LoginForm from "@/components/login/LoginForm";
import AppMascot from "@/components/brand/AppMascot";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useRedirectIfAuthed } from "@/hooks/useRedirectIfAuthed";

/** Tema claro solo para la tarjeta de login sobre el panel morado. */
const loginFormTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#7c3aed",
      dark: "#5b21b6",
      light: "#a78bfa",
      contrastText: "#fff",
    },
    background: {
      default: "#eceef2",
      paper: "#ffffff",
    },
    text: {
      primary: "#14151a",
      secondary: "rgba(20, 21, 26, 0.64)",
    },
    divider: "rgba(20, 21, 26, 0.12)",
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      "var(--font-geist-sans), 'Inter', system-ui, -apple-system, sans-serif",
    button: { fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
  },
});

export default function Home() {
  const ready = useRedirectIfAuthed();

  if (!ready) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#0a0c10",
        }}
      >
        <CircularProgress color="primary" sx={{ color: "#7c3aed" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        overflow: "hidden",
        width: "100%",
        maxWidth: "100vw",
        position: "relative",
        bgcolor: "#000000",
      }}
    >
      {/* Clip SVG: borde curvo entre paneles (solo desktop) */}
      <Box
        component="svg"
        width={0}
        height={0}
        sx={{ position: "absolute", overflow: "hidden", m: 0, p: 0 }}
        aria-hidden
      >
        <defs>
          <clipPath id="loginPurpleWave" clipPathUnits="objectBoundingBox">
            <path d="M 0.085 0 C -0.04 0.2 -0.04 0.8 0.085 1 L 1 1 L 1 0 Z" />
          </clipPath>
        </defs>
      </Box>

      {/* Panel negro + mascota */}
      <Box
        sx={{
          flex: { md: "0 0 50%" },
          width: { md: "50%" },
          minWidth: 0,
          bgcolor: "#000000",
          color: "rgba(255,255,255,0.92)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2.5, sm: 4 },
          py: { xs: 4, md: 6 },
          position: "relative",
          zIndex: 1,
          order: { xs: 0, md: 0 },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 1,
            background:
              "radial-gradient(ellipse 80% 55% at 50% 20%, rgba(124, 58, 237, 0.22), transparent 58%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(91, 33, 182, 0.12), transparent 50%)",
            pointerEvents: "none",
          }}
        />
        <Stack
          spacing={2.5}
          alignItems="center"
          sx={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            maxWidth: 400,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
            <TaskAltIcon sx={{ fontSize: 36, color: "#a78bfa" }} />
            <Typography
              variant="h5"
              fontWeight={800}
              letterSpacing="0.06em"
              sx={{
                background: "linear-gradient(120deg, #e9d5ff 0%, #fff 45%, #c4b5fd 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              OVER APP
            </Typography>
          </Stack>
          <AppMascot maxWidth={{ xs: 200, sm: 248, md: 280 }} />
          <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.72)", lineHeight: 1.65, px: 1 }}>
            Tareas y equipo en un solo lugar. Te damos la bienvenida.
          </Typography>
        </Stack>
      </Box>

      {/* Panel morado + formulario (borde izquierdo curvo en desktop) */}
      <Box
        sx={{
          flex: { md: "1 1 50%" },
          width: { xs: "100%", md: "auto" },
          minWidth: 0,
          minHeight: { xs: "auto", md: "100vh" },
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 4, md: 6 },
          background: {
            xs: "linear-gradient(168deg, #4c1d95 0%, #6d28d9 38%, #7c3aed 70%, #5b21b6 100%)",
            md: "linear-gradient(145deg, #3d1a7a 0%, #5b21b6 35%, #7c3aed 68%, #6d28d9 100%)",
          },
          overflow: "hidden",
          clipPath: { md: "url(#loginPurpleWave)" },
          WebkitClipPath: { md: "url(#loginPurpleWave)" },
          borderTopLeftRadius: { xs: 24, md: 0 },
          borderBottomLeftRadius: { xs: 24, md: 0 },
        }}
      >
        {/* Brillo circular (refuerza la forma redonda hacia el negro) */}
        <Box
          aria-hidden
          sx={{
            display: { xs: "none", md: "block" },
            position: "absolute",
            left: "-18%",
            top: "50%",
            transform: "translateY(-50%)",
            width: "95%",
            maxWidth: 900,
            aspectRatio: "1",
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.07)",
            pointerEvents: "none",
          }}
        />
        <Box
          aria-hidden
          sx={{
            display: { xs: "none", md: "block" },
            position: "absolute",
            right: "-15%",
            bottom: "-20%",
            width: "60%",
            aspectRatio: "1",
            borderRadius: "50%",
            bgcolor: "rgba(0,0,0,0.1)",
            pointerEvents: "none",
          }}
        />

        <ThemeProvider theme={loginFormTheme}>
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              maxWidth: 440,
              minWidth: 0,
            }}
          >
            <LoginForm />
          </Box>
        </ThemeProvider>
      </Box>
    </Box>
  );
}

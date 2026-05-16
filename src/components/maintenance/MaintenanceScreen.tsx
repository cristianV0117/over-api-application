"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AppMascot from "@/components/brand/AppMascot";

const bg = "#0a0c10";
const primaryLight = "#a78bfa";
const accent = "#c94b6d";

export default function MaintenanceScreen() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 4,
        bgcolor: bg,
        backgroundImage: `
          radial-gradient(ellipse 80% 55% at 50% -10%, rgba(124, 58, 237, 0.28), transparent 55%),
          radial-gradient(ellipse 60% 40% at 100% 100%, rgba(201, 75, 109, 0.12), transparent 50%),
          radial-gradient(ellipse 50% 35% at 0% 80%, rgba(124, 58, 237, 0.1), transparent 45%)
        `,
      }}
    >
      <Stack alignItems="center" spacing={3} sx={{ maxWidth: 440, textAlign: "center" }}>
        <AppMascot maxWidth={{ xs: 200, sm: 240 }} />
        <Box
          sx={{
            px: 3,
            py: 2.5,
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.08)",
            bgcolor: "rgba(18, 21, 28, 0.85)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 0 0 1px rgba(124, 58, 237, 0.12), 0 24px 48px rgba(0,0,0,0.45)",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.03em",
              mb: 1,
              background: `linear-gradient(135deg, ${primaryLight} 0%, #fff 45%, ${accent} 100%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            OVER APP en mantenimiento
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.65 }}>
            Estamos mejorando la aplicación. En unos minutos debería volver a estar disponible.
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)", display: "block", mt: 1.5 }}>
            Si necesitas desactivar este mensaje, pon{" "}
            <Box component="code" sx={{ color: primaryLight, fontSize: "0.8rem" }}>
              MAINTENANCE_MODE=false
            </Box>{" "}
            en el entorno y reinicia el despliegue.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

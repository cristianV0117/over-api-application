"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const bg = "#0a0c10";
const primary = "#7c3aed";
const primaryLight = "#a78bfa";
const accent = "#c94b6d";

/** Mascota tipo cartoon (SVG), colores alineados con el tema OVER APP */
function MaintenanceMascot() {
  return (
    <Box
      component="svg"
      viewBox="0 0 280 300"
      role="img"
      aria-label="Personaje de mantenimiento"
      sx={{
        width: { xs: 200, sm: 240 },
        height: "auto",
        filter: "drop-shadow(0 12px 32px rgba(124, 58, 237, 0.35))",
        animation: "maint-float 3.2s ease-in-out infinite",
        "@keyframes maint-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      }}
    >
      <defs>
        <linearGradient id="maint-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5b21b6" />
          <stop offset="55%" stopColor={primary} />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
        <linearGradient id="maint-face" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2a2438" />
          <stop offset="100%" stopColor="#15121c" />
        </linearGradient>
        <radialGradient id="maint-glow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="rgba(124, 58, 237, 0.5)" />
          <stop offset="100%" stopColor="rgba(124, 58, 237, 0)" />
        </radialGradient>
      </defs>
      <ellipse cx="140" cy="275" rx="88" ry="14" fill="rgba(124, 58, 237, 0.22)" />
      <circle cx="140" cy="150" r="118" fill="url(#maint-glow)" opacity={0.6} />
      {/* Cuerpo */}
      <rect
        x="75"
        y="155"
        width="130"
        height="115"
        rx="44"
        fill="url(#maint-body)"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="2"
      />
      {/* Brazos */}
      <ellipse cx="58" cy="175" rx="22" ry="40" fill="#5b21b6" transform="rotate(-25 58 175)" />
      <ellipse cx="222" cy="175" rx="22" ry="40" fill="#5b21b6" transform="rotate(25 222 175)" />
      {/* Llave inglesa sencilla (cartoon) */}
      <g transform="translate(215 168) rotate(15)">
        <rect x="0" y="-8" width="36" height="16" rx="4" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />
        <rect x="-4" y="-14" width="12" height="28" rx="3" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />
      </g>
      {/* Cabeza */}
      <circle
        cx="140"
        cy="105"
        r="58"
        fill="url(#maint-face)"
        stroke={primary}
        strokeWidth="3"
      />
      {/* Orejas redondas */}
      <circle cx="82" cy="108" r="14" fill="#1e1a2e" stroke={primary} strokeWidth="2" />
      <circle cx="198" cy="108" r="14" fill="#1e1a2e" stroke={primary} strokeWidth="2" />
      {/* Antena */}
      <line x1="140" y1="48" x2="140" y2="22" stroke={accent} strokeWidth="5" strokeLinecap="round" />
      <circle cx="140" cy="16" r="10" fill={accent} stroke="#fff" strokeWidth="2" opacity={0.95} />
      {/* Ojos grandes cartoon */}
      <ellipse cx="118" cy="100" rx="14" ry="18" fill="#fff" />
      <ellipse cx="162" cy="100" rx="14" ry="18" fill="#fff" />
      <circle cx="122" cy="102" r="9" fill={primary} />
      <circle cx="166" cy="102" r="9" fill={primary} />
      <circle cx="125" cy="98" r="3" fill="#fff" opacity={0.9} />
      <circle cx="169" cy="98" r="3" fill="#fff" opacity={0.9} />
      {/* Sonrisa */}
      <path
        d="M 112 128 Q140 150 168 128"
        fill="none"
        stroke={primaryLight}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Mejilla */}
      <ellipse cx="95" cy="118" rx="10" ry="6" fill={accent} opacity={0.35} />
      <ellipse cx="185" cy="118" rx="10" ry="6" fill={accent} opacity={0.35} />
    </Box>
  );
}

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
        <MaintenanceMascot />
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

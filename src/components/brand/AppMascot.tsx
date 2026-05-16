"use client";

import Box from "@mui/material/Box";

const primary = "#7c3aed";
const primaryLight = "#a78bfa";
const accent = "#c94b6d";

type AppMascotProps = {
  /** Ancho aproximado en px (responsive por defecto). */
  maxWidth?: { xs: number; sm?: number; md?: number };
};

/**
 * Mascota cartoon (SVG), mismos colores que en la pantalla de mantenimiento.
 */
export default function AppMascot({ maxWidth = { xs: 220, sm: 260, md: 280 } }: AppMascotProps) {
  return (
    <Box
      component="svg"
      viewBox="0 0 280 300"
      role="img"
      aria-label="Mascota OVER APP"
      sx={{
        width: "100%",
        maxWidth,
        height: "auto",
        filter: "drop-shadow(0 12px 32px rgba(124, 58, 237, 0.35))",
        animation: "mascot-float 3.2s ease-in-out infinite",
        "@keyframes mascot-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      }}
    >
      <defs>
        <linearGradient id="mascot-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5b21b6" />
          <stop offset="55%" stopColor={primary} />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
        <linearGradient id="mascot-face" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2a2438" />
          <stop offset="100%" stopColor="#15121c" />
        </linearGradient>
        <radialGradient id="mascot-glow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="rgba(124, 58, 237, 0.5)" />
          <stop offset="100%" stopColor="rgba(124, 58, 237, 0)" />
        </radialGradient>
      </defs>
      <ellipse cx="140" cy="275" rx="88" ry="14" fill="rgba(124, 58, 237, 0.22)" />
      <circle cx="140" cy="150" r="118" fill="url(#mascot-glow)" opacity={0.6} />
      <rect
        x="75"
        y="155"
        width="130"
        height="115"
        rx="44"
        fill="url(#mascot-body)"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="2"
      />
      <ellipse cx="58" cy="175" rx="22" ry="40" fill="#5b21b6" transform="rotate(-25 58 175)" />
      <ellipse cx="222" cy="175" rx="22" ry="40" fill="#5b21b6" transform="rotate(25 222 175)" />
      <g transform="translate(215 168) rotate(15)">
        <rect x="0" y="-8" width="36" height="16" rx="4" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />
        <rect x="-4" y="-14" width="12" height="28" rx="3" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />
      </g>
      <circle
        cx="140"
        cy="105"
        r="58"
        fill="url(#mascot-face)"
        stroke={primary}
        strokeWidth="3"
      />
      <circle cx="82" cy="108" r="14" fill="#1e1a2e" stroke={primary} strokeWidth="2" />
      <circle cx="198" cy="108" r="14" fill="#1e1a2e" stroke={primary} strokeWidth="2" />
      <line x1="140" y1="48" x2="140" y2="22" stroke={accent} strokeWidth="5" strokeLinecap="round" />
      <circle cx="140" cy="16" r="10" fill={accent} stroke="#fff" strokeWidth="2" opacity={0.95} />
      <ellipse cx="118" cy="100" rx="14" ry="18" fill="#fff" />
      <ellipse cx="162" cy="100" rx="14" ry="18" fill="#fff" />
      <circle cx="122" cy="102" r="9" fill={primary} />
      <circle cx="166" cy="102" r="9" fill={primary} />
      <circle cx="125" cy="98" r="3" fill="#fff" opacity={0.9} />
      <circle cx="169" cy="98" r="3" fill="#fff" opacity={0.9} />
      <path
        d="M 112 128 Q140 150 168 128"
        fill="none"
        stroke={primaryLight}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <ellipse cx="95" cy="118" rx="10" ry="6" fill={accent} opacity={0.35} />
      <ellipse cx="185" cy="118" rx="10" ry="6" fill={accent} opacity={0.35} />
    </Box>
  );
}

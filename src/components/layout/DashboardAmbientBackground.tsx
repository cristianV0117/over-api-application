"use client";

import Box from "@mui/material/Box";

/**
 * Fondo del dashboard: negro sólido + líneas curvas moradas muy finas (sin degradés ni halos).
 */
export default function DashboardAmbientBackground() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        bgcolor: "#000000",
      }}
    >
      <Box
        component="svg"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1920 1080"
        sx={{
          position: "absolute",
          left: "50%",
          top: "50%",
          minWidth: "100%",
          minHeight: "100%",
          width: "100vw",
          height: "100vh",
          transform: "translate(-50%, -50%)",
        }}
      >
        <defs>
          <linearGradient id="dash-line-fade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0" />
            <stop offset="45%" stopColor="#a78bfa" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect width="1920" height="1080" fill="#000000" />

        <path
          d="M -160 640 C 420 520 620 760 1040 600 S 1680 520 2080 460"
          fill="none"
          stroke="url(#dash-line-fade)"
          strokeWidth="1.1"
        />
        <path
          d="M -120 240 C 380 400 720 160 1180 280 S 1820 200 2100 120"
          fill="none"
          stroke="#a78bfa"
          strokeOpacity={0.11}
          strokeWidth="1"
        />
        <path
          d="M -80 980 C 480 820 900 1080 1400 900 S 1900 760 2200 820"
          fill="none"
          stroke="#7c3aed"
          strokeOpacity={0.1}
          strokeWidth="1"
        />
        <path
          d="M -100 420 C 520 320 900 520 1320 440 S 1780 380 2100 400"
          fill="none"
          stroke="#c4b5fd"
          strokeOpacity={0.08}
          strokeWidth="0.9"
        />
      </Box>
    </Box>
  );
}

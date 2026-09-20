"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import type { PortfolioConfig } from "@/lib/portfolio/types";
import PortfolioGridDisplay from "./PortfolioGridDisplay";

type Props = {
  config: PortfolioConfig;
  preview?: boolean;
};

export default function PortfolioRenderer({ config, preview }: Props) {
  const { theme, sections } = config;

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        color: "rgba(255,255,255,0.92)",
        bgcolor: theme.background,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 90% 70% at 10% -10%, ${hexToRgba(theme.accentFrom, 0.28)}, transparent 55%),
            radial-gradient(ellipse 60% 50% at 95% 20%, ${hexToRgba(theme.accentTo, 0.12)}, transparent 50%),
            radial-gradient(ellipse 50% 40% at 50% 100%, rgba(45, 10, 21, 0.55), transparent 45%)
          `,
          pointerEvents: "none",
        },
      }}
    >
      {preview ? (
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            py: 1,
            textAlign: "center",
            bgcolor: "rgba(107,47,184,0.35)",
            borderBottom: `1px solid ${theme.line}`,
            fontSize: "0.85rem",
          }}
        >
          Vista previa del portafolio
        </Box>
      ) : null}
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: 4 }}>
        <PortfolioGridDisplay blocks={sections} theme={theme} />
      </Container>
    </Box>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return `rgba(107,47,184,${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

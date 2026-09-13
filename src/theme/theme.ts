"use client";

import { createTheme, type Theme } from "@mui/material/styles";
import { enUS, esES } from "@mui/material/locale";
import type { Locale, ThemeMode } from "@/i18n/types";

const primary = {
  main: "#7c3aed",
  light: "#a78bfa",
  dark: "#5b21b6",
  contrastText: "#ffffff",
};

const shared = {
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      "var(--font-geist-sans), 'Inter', system-ui, -apple-system, sans-serif",
    h3: { fontWeight: 700, letterSpacing: "-0.02em" },
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" as const },
  },
};

export function createAppTheme(mode: ThemeMode, locale: Locale = "es"): Theme {
  const dark = mode === "dark";
  const muiLocale = locale === "en" ? enUS : esES;

  return createTheme(
    {
      ...shared,
      palette: {
        mode,
        primary,
        secondary: {
          main: "#38bdf8",
          dark: "#0284c7",
          light: "#7dd3fc",
        },
        background: dark
          ? { default: "#0a0c10", paper: "#12151c" }
          : { default: "#f3f4f8", paper: "#ffffff" },
        divider: dark ? "rgba(255, 255, 255, 0.08)" : "rgba(20, 21, 26, 0.1)",
        text: dark
          ? {
              primary: "rgba(255, 255, 255, 0.95)",
              secondary: "rgba(255, 255, 255, 0.65)",
            }
          : {
              primary: "#14151a",
              secondary: "rgba(20, 21, 26, 0.64)",
            },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              scrollbarColor: `${primary.main} transparent`,
            },
          },
        },
        MuiButton: {
          defaultProps: { disableElevation: true },
          styleOverrides: {
            root: { borderRadius: 10 },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: "none",
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundImage: "none",
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              border: "1px solid",
              borderColor: "divider",
              backgroundImage: "none",
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              borderRight: dark
                ? "1px solid rgba(255, 255, 255, 0.04)"
                : "1px solid rgba(20, 21, 26, 0.08)",
              backgroundImage: dark
                ? "linear-gradient(180deg, rgba(124, 58, 237, 0.06) 0%, transparent 40%)"
                : "linear-gradient(180deg, rgba(124, 58, 237, 0.05) 0%, transparent 40%)",
            },
          },
        },
        MuiTextField: {
          defaultProps: { variant: "outlined", size: "small" },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              border: "1px solid",
              borderColor: "divider",
            },
          },
        },
      },
    },
    muiLocale
  );
}

/** @deprecated usa createAppTheme — se mantiene por compatibilidad */
export const appTheme = createAppTheme("dark", "es");

"use client";

import { createTheme } from "@mui/material/styles";

const primary = {
  main: "#7c3aed",
  light: "#a78bfa",
  dark: "#5b21b6",
  contrastText: "#ffffff",
};

export const appTheme = createTheme({
  palette: {
    mode: "dark",
    primary,
    secondary: {
      main: "#38bdf8",
      dark: "#0284c7",
      light: "#7dd3fc",
    },
    background: {
      default: "#0a0c10",
      paper: "#12151c",
    },
    divider: "rgba(255, 255, 255, 0.08)",
    text: {
      primary: "rgba(255, 255, 255, 0.95)",
      secondary: "rgba(255, 255, 255, 0.65)",
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      "var(--font-geist-sans), 'Inter', system-ui, -apple-system, sans-serif",
    h3: { fontWeight: 700, letterSpacing: "-0.02em" },
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
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
          borderRight: "1px solid",
          borderColor: "divider",
          backgroundImage:
            "linear-gradient(180deg, rgba(124, 58, 237, 0.06) 0%, transparent 40%)",
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
});

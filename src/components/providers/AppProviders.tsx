"use client";

import { useMemo } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { ToastContainer, Zoom } from "react-toastify";
import { PreferencesProvider, usePreferences } from "@/context/preferencesContext";
import { createAppTheme } from "@/theme/theme";

function ThemedApp({ children }: { children: React.ReactNode }) {
  const { themeMode, locale } = usePreferences();
  const theme = useMemo(
    () => createAppTheme(themeMode, locale),
    [themeMode, locale]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        transition={Zoom}
        theme={themeMode}
      />
    </ThemeProvider>
  );
}

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <PreferencesProvider>
        <ThemedApp>{children}</ThemedApp>
      </PreferencesProvider>
    </AppRouterCacheProvider>
  );
}

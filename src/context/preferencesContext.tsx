"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  LOCALE_STORAGE_KEY,
  THEME_STORAGE_KEY,
  type Locale,
  type ThemeMode,
} from "@/i18n/types";
import { translate, type MessageKey } from "@/i18n";

type PreferencesContextValue = {
  themeMode: ThemeMode;
  locale: Locale;
  setThemeMode: (mode: ThemeMode) => void;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" ? "light" : "dark";
}

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "es";
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === "en" ? "en" : "es";
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("dark");
  const [locale, setLocaleState] = useState<Locale>("es");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setThemeModeState(readStoredTheme());
    setLocaleState(readStoredLocale());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale;
    document.documentElement.dataset.theme = themeMode;
    document.documentElement.style.colorScheme = themeMode;
  }, [locale, themeMode, ready]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) =>
      translate(locale, key, vars),
    [locale]
  );

  const value = useMemo(
    () => ({ themeMode, locale, setThemeMode, setLocale, t }),
    [themeMode, locale, setThemeMode, setLocale, t]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return ctx;
}

"use client";

import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { usePreferences } from "@/context/preferencesContext";

export default function PreferenceToggles({
  contrast = "default",
}: {
  contrast?: "default" | "onBrand";
}) {
  const { themeMode, setThemeMode, locale, setLocale, t } = usePreferences();
  const color = contrast === "onBrand" ? "inherit" : "default";

  return (
    <Stack direction="row" alignItems="center" spacing={0.25}>
      <Tooltip
        title={
          themeMode === "dark" ? t("prefs.switchToLight") : t("prefs.switchToDark")
        }
      >
        <IconButton
          color={color}
          size="small"
          onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
          aria-label={
            themeMode === "dark" ? t("prefs.switchToLight") : t("prefs.switchToDark")
          }
        >
          {themeMode === "dark" ? (
            <LightModeOutlinedIcon fontSize="small" />
          ) : (
            <DarkModeOutlinedIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
      <Tooltip title={locale === "es" ? t("prefs.switchToEn") : t("prefs.switchToEs")}>
        <IconButton
          color={color}
          size="small"
          onClick={() => setLocale(locale === "es" ? "en" : "es")}
          aria-label={locale === "es" ? t("prefs.switchToEn") : t("prefs.switchToEs")}
          sx={{ minWidth: 36 }}
        >
          <Typography variant="caption" fontWeight={800} letterSpacing={0.4}>
            {locale === "es" ? "EN" : "ES"}
          </Typography>
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

"use client";

import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import TranslateOutlinedIcon from "@mui/icons-material/TranslateOutlined";
import { usePreferences } from "@/context/preferencesContext";
import type { Locale, ThemeMode } from "@/i18n/types";

export default function SettingsPage() {
  const { themeMode, setThemeMode, locale, setLocale, t } = usePreferences();

  return (
    <Box sx={{ maxWidth: 640, mx: "auto", width: "100%" }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
        {t("prefs.title")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("prefs.subtitle")}
      </Typography>

      <Stack spacing={2}>
        <Paper sx={{ p: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            {themeMode === "dark" ? (
              <DarkModeOutlinedIcon color="primary" fontSize="small" />
            ) : (
              <LightModeOutlinedIcon color="primary" fontSize="small" />
            )}
            <Typography fontWeight={700}>{t("prefs.appearance")}</Typography>
          </Stack>
          <FormControl>
            <FormLabel sx={{ mb: 1 }}>{t("prefs.appearance")}</FormLabel>
            <RadioGroup
              value={themeMode}
              onChange={(_, v) => setThemeMode(v as ThemeMode)}
            >
              <FormControlLabel
                value="dark"
                control={<Radio />}
                label={
                  <Box>
                    <Typography fontWeight={600}>{t("prefs.dark")}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("prefs.darkHelp")}
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="light"
                control={<Radio />}
                label={
                  <Box>
                    <Typography fontWeight={600}>{t("prefs.light")}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("prefs.lightHelp")}
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </Paper>

        <Paper sx={{ p: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <TranslateOutlinedIcon color="primary" fontSize="small" />
            <Typography fontWeight={700}>{t("prefs.language")}</Typography>
          </Stack>
          <FormControl>
            <FormLabel sx={{ mb: 1 }}>{t("prefs.language")}</FormLabel>
            <RadioGroup
              value={locale}
              onChange={(_, v) => setLocale(v as Locale)}
            >
              <FormControlLabel
                value="es"
                control={<Radio />}
                label={t("prefs.spanish")}
              />
              <FormControlLabel
                value="en"
                control={<Radio />}
                label={t("prefs.english")}
              />
            </RadioGroup>
          </FormControl>
        </Paper>
      </Stack>
    </Box>
  );
}

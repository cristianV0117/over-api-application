"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import CloseIcon from "@mui/icons-material/Close";
import IosShareIcon from "@mui/icons-material/IosShare";
import AddBoxIcon from "@mui/icons-material/AddBox";

const STORAGE_KEY = "overapp-pwa-install-hint-dismissed";

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone === true) return true;
  return window.matchMedia("(display-mode: standalone)").matches;
}

export default function InstallPWABanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (!isIOS() || isStandalone()) return;
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
      setVisible(true);
    } catch {
      setVisible(false);
    }
  }, []);

  if (!visible) return null;

  return (
    <Box
      sx={{
        px: 2,
        py: 1.25,
        mb: 2,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: "rgba(124, 58, 237, 0.12)",
        position: "relative",
      }}
    >
      <IconButton
        size="small"
        aria-label="Cerrar aviso"
        onClick={() => {
          try {
            localStorage.setItem(STORAGE_KEY, "1");
          } catch {
            /* ignore */
          }
          setVisible(false);
        }}
        sx={{ position: "absolute", top: 4, right: 4 }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      <Stack direction="row" alignItems="flex-start" spacing={1.25} sx={{ pr: 4 }}>
        <IosShareIcon sx={{ color: "primary.light", mt: 0.25, flexShrink: 0 }} fontSize="small" />
        <Box>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Instalar OVER en tu iPhone
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.5 }}>
            Sin App Store: en Safari, pulsa{" "}
            <Box component="span" sx={{ color: "primary.light", fontWeight: 600 }}>
              Compartir
            </Box>{" "}
            <IosShareIcon sx={{ fontSize: 16, verticalAlign: "text-bottom", mx: 0.25 }} /> y elige{" "}
            <Box component="span" sx={{ color: "primary.light", fontWeight: 600 }}>
              Añadir a pantalla de inicio
            </Box>{" "}
            <AddBoxIcon sx={{ fontSize: 16, verticalAlign: "text-bottom", mx: 0.25 }} />.
            Abre la web con HTTPS (producción).
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              try {
                localStorage.setItem(STORAGE_KEY, "1");
              } catch {
                /* ignore */
              }
              setVisible(false);
            }}
          >
            Entendido
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import DownloadIcon from "@mui/icons-material/Download";
import { ensureCvFonts } from "@/lib/cv/fonts";
import { resolveTechIconPngs } from "@/lib/cv/techIcons";
import { CvPdfDocument } from "./CvDocument";
import type { CvConfig } from "@/lib/cv/types";

type Props = {
  config: CvConfig;
  height?: number | string;
};

function payloadOf(config: CvConfig) {
  return JSON.stringify({
    name: config.name,
    theme: config.theme,
    header: config.header,
    sections: config.sections,
  });
}

function CvPreview({ config, height = "100%" }: Props) {
  const payload = useMemo(() => payloadOf(config), [config]);
  const configRef = useRef(config);
  configRef.current = config;

  const [url, setUrl] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);
  const genRef = useRef(0);

  useEffect(() => {
    const gen = ++genRef.current;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          ensureCvFonts();
          const current = configRef.current;
          const iconPngs = await resolveTechIconPngs(current);
          const blob = await pdf(<CvPdfDocument config={current} iconPngs={iconPngs} />).toBlob();
          if (gen !== genRef.current) return;
          const next = URL.createObjectURL(blob);
          const prev = urlRef.current;
          urlRef.current = next;
          setUrl(next);
          if (prev) window.setTimeout(() => URL.revokeObjectURL(prev), 1500);
        } catch {
          /* el visor conserva el PDF anterior */
        }
      })();
    }, 550);
    return () => window.clearTimeout(timer);
  }, [payload]);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    []
  );

  const fileName = `${(config.header.fullName || config.name || "cv")
    .toLowerCase()
    .replace(/\s+/g, "-")}.pdf`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height, minHeight: 480 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Vista previa en tiempo real
        </Typography>
        <Button
          size="small"
          startIcon={<DownloadIcon />}
          disabled={!url}
          href={url || "#"}
          download={fileName}
        >
          Descargar PDF
        </Button>
      </Box>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          borderRadius: 1,
          overflow: "hidden",
          border: 1,
          borderColor: "divider",
          bgcolor: "grey.200",
          position: "relative",
        }}
      >
        {url ? (
          <Box
            component="iframe"
            title="Vista previa del CV"
            src={url}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: 0,
            }}
          />
        ) : (
          <Typography
            color="text.secondary"
            sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}
          >
            Generando vista previa…
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default memo(CvPreview, (prev, next) => payloadOf(prev.config) === payloadOf(next.config));

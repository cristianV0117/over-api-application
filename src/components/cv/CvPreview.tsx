"use client";

import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import DownloadIcon from "@mui/icons-material/Download";
import { CvPdfDocument } from "./CvDocument";
import type { CvConfig } from "@/lib/cv/types";

type Props = {
  config: CvConfig;
  height?: number | string;
};

export default function CvPreview({ config, height = "100%" }: Props) {
  const fileName = `${(config.header.fullName || config.name || "cv")
    .toLowerCase()
    .replace(/\s+/g, "-")}.pdf`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height, minHeight: 480 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Vista previa en tiempo real
        </Typography>
        <PDFDownloadLink
          document={<CvPdfDocument config={config} />}
          fileName={fileName}
          style={{ textDecoration: "none" }}
        >
          {({ loading }) => (
            <Button component="span" size="small" startIcon={<DownloadIcon />} disabled={loading}>
              {loading ? "Generando…" : "Descargar PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, borderRadius: 1, overflow: "hidden", border: 1, borderColor: "divider" }}>
        <PDFViewer width="100%" height="100%" showToolbar={false}>
          <CvPdfDocument config={config} />
        </PDFViewer>
      </Box>
    </Box>
  );
}

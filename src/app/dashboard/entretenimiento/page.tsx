"use client";

import NextLink from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import LiveTvOutlinedIcon from "@mui/icons-material/LiveTvOutlined";
import VideogameAssetOutlinedIcon from "@mui/icons-material/VideogameAssetOutlined";
import { usePreferences } from "@/context/preferencesContext";

export default function EntretenimientoPage() {
  const { t } = usePreferences();
  return (
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      <Typography variant="h4" fontWeight={800}>
        {t("ent.title")}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {t("ent.subtitle")}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 2,
        }}
      >
        <Card
          variant="outlined"
          sx={{
            background:
              "linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, transparent 60%)",
          }}
        >
          <CardActionArea component={NextLink} href="/dashboard/entretenimiento/animes">
            <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <LiveTvOutlinedIcon color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography fontWeight={800}>{t("ent.animeTitle")}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("ent.animeDesc")}
                </Typography>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
        <Card
          variant="outlined"
          sx={{
            background:
              "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, transparent 60%)",
          }}
        >
          <CardActionArea component={NextLink} href="/dashboard/entretenimiento/juegos">
            <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <VideogameAssetOutlinedIcon color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography fontWeight={800}>{t("ent.gamesTitle")}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("ent.gamesDesc")}
                </Typography>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>
    </Box>
  );
}

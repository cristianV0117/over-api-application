"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { usePreferences } from "@/context/preferencesContext";

export default function ChatRedirectPage() {
  const router = useRouter();
  const { t } = usePreferences();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <Box sx={{ py: 6, textAlign: "center" }}>
      <CircularProgress size={32} sx={{ mb: 2 }} />
      <Typography color="text.secondary">{t("redirect.dashboard")}</Typography>
    </Box>
  );
}

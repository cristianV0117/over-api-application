"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { usePreferences } from "@/context/preferencesContext";

export default function Footer() {
  const { t } = usePreferences();
  const [year, setYear] = useState("");

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        py: 3,
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © {year} OVER APP. {t("footer.rights")}
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 0.5 }}>
          {t("footer.made")} ·{" "}
          <Link href="#" color="primary" underline="hover">
            {t("footer.support")}
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}

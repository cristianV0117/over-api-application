"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import LayersIcon from "@mui/icons-material/Layers";
import { useLogout } from "@/hooks/useLogout";
import { usePreferences } from "@/context/preferencesContext";
import PreferenceToggles from "@/components/prefs/PreferenceToggles";

type NavbarProps = {
  onMenuClick?: () => void;
};

export default function Navbar({ onMenuClick }: NavbarProps) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const pathname = usePathname();
  const logout = useLogout();
  const { t } = usePreferences();

  const navLinkSx = {
    color: "text.secondary",
    "&:hover": { color: "primary.light" },
    ...(pathname === "/dashboard" && { color: "text.primary" }),
  } as const;

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        backgroundImage:
          "linear-gradient(180deg, rgba(124, 58, 237, 0.06) 0%, transparent 40%)",
      }}
    >
      <Toolbar
        sx={{
          gap: { xs: 0.5, sm: 2 },
          py: 1,
          px: { xs: 1, sm: 2 },
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        {!isMdUp && onMenuClick && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            aria-label={t("nav.openMenu")}
            sx={{ flexShrink: 0 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Box
          component={Link}
          href="/dashboard"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textDecoration: "none",
            color: "inherit",
            mr: "auto",
            minWidth: 0,
          }}
        >
          <LayersIcon sx={{ color: "primary.main", fontSize: 28, flexShrink: 0 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              letterSpacing: "0.04em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            OVER APP
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ display: { xs: "none", sm: "flex" } }}
        >
          <Button
            component={Link}
            href="/dashboard"
            color="inherit"
            sx={navLinkSx}
          >
            {t("nav.home")}
          </Button>
          <Button
            component={Link}
            href="/cristiandev"
            color="inherit"
            sx={{
              color: "text.secondary",
              "&:hover": { color: "primary.light" },
              ...(pathname.startsWith("/cristiandev") && { color: "text.primary" }),
            }}
          >
            CristianDev
          </Button>
          <Button href="#" color="inherit" sx={{ color: "text.secondary" }}>
            {t("nav.features")}
          </Button>
          <Button href="#" color="inherit" sx={{ color: "text.secondary" }}>
            {t("nav.contact")}
          </Button>
        </Stack>

        <PreferenceToggles />

        <Button
          variant="contained"
          color="primary"
          onClick={logout}
          sx={{
            px: { xs: 1.25, sm: 2.5 },
            flexShrink: 0,
            fontSize: { xs: "0.8125rem", sm: "0.875rem" },
          }}
        >
          {t("nav.logout")}
        </Button>
      </Toolbar>
    </AppBar>
  );
}

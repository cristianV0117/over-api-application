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

type NavbarProps = {
  onMenuClick?: () => void;
};

export default function Navbar({ onMenuClick }: NavbarProps) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const pathname = usePathname();
  const logout = useLogout();

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
        backdropFilter: "blur(12px)",
        bgcolor: "rgba(10, 12, 16, 0.85)",
      }}
    >
      <Toolbar sx={{ gap: 2, py: 1 }}>
        {!isMdUp && onMenuClick && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            aria-label="abrir menú"
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
          }}
        >
          <LayersIcon sx={{ color: "primary.main", fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: "0.04em" }}>
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
            Inicio
          </Button>
          <Button href="#" color="inherit" sx={{ color: "text.secondary" }}>
            Funciones
          </Button>
          <Button href="#" color="inherit" sx={{ color: "text.secondary" }}>
            Contacto
          </Button>
        </Stack>

        <Button variant="contained" color="primary" onClick={logout} sx={{ px: 2.5 }}>
          Cerrar sesión
        </Button>
      </Toolbar>
    </AppBar>
  );
}

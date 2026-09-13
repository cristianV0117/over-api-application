"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import { useUser } from "@/context/userContext";
import { usePreferences } from "@/context/preferencesContext";
import { avatarUrl } from "@/lib/api/profile";

const DRAWER_WIDTH = 268;

const allItems = [
  { href: "/dashboard/users", labelKey: "sidebar.users" as const, Icon: PeopleOutlineIcon, adminOnly: true },
  { href: "/dashboard/tasks", labelKey: "sidebar.tasks" as const, Icon: ViewKanbanOutlinedIcon },
  {
    href: "/dashboard/contabilidad",
    labelKey: "sidebar.finance" as const,
    Icon: AccountBalanceWalletOutlinedIcon,
  },
  { href: "/dashboard/cron", labelKey: "sidebar.cron" as const, Icon: ScheduleOutlinedIcon, adminOnly: true },
  { href: "/dashboard/vehiculo", labelKey: "sidebar.vehicle" as const, Icon: DirectionsCarOutlinedIcon },
  { href: "/dashboard/profile", labelKey: "sidebar.profile" as const, Icon: PersonOutlineIcon },
  { href: "/dashboard/settings", labelKey: "sidebar.settings" as const, Icon: SettingsOutlinedIcon },
];

type SidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const user = useUser();
  const { t } = usePreferences();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const items = allItems.filter(
    (i) => !("adminOnly" in i && i.adminOnly) || user?.role === "admin"
  );

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ px: 2.5, py: 3 }}>
        <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: 2 }}>
          {t("sidebar.menu")}
        </Typography>
      </Box>
      <List sx={{ px: 1.5, flex: 1 }}>
        {items.map((item) => {
          const { href, labelKey, Icon } = item;
          const disabled = Boolean("disabled" in item && item.disabled);
          const label = t(labelKey);
          const selected = href !== "#" && pathname.startsWith(href);
          return (
            <ListItemButton
              key={labelKey}
              component={disabled ? "div" : NextLink}
              href={disabled ? undefined : href}
              selected={selected}
              disabled={disabled}
              onClick={() => !isMdUp && onMobileClose()}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "& .MuiListItemIcon-root": { color: "inherit" },
                  "&:hover": { bgcolor: "primary.dark" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: selected ? "inherit" : "text.secondary" }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          );
        })}
      </List>
      <Divider sx={{ borderColor: "divider" }} />
      <Box
        component={NextLink}
        href="/dashboard/profile"
        onClick={() => !isMdUp && onMobileClose()}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 2,
          textDecoration: "none",
          color: "inherit",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Avatar
          src={avatarUrl(user?.avatarUrl)}
          alt=""
          sx={{ width: 40, height: 40, border: "2px solid", borderColor: "primary.main" }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap fontWeight={700}>
            {user?.name ?? t("sidebar.userFallback")}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {t("sidebar.viewProfile")}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}

"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { UserContext } from "@/context/userContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Navbar from "@/components/menus/Navbar";
import Sidebar from "@/components/menus/Sidebar";
import Footer from "@/components/Footer";
import AssistantWidget from "@/components/assistant/AssistantWidget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authorized, checking, user, setUser } = useAuthGuard();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (checking) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!authorized) return null;

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
          <Sidebar
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
          />
          <Box
            component="main"
            sx={{
              flex: 1,
              overflow: "auto",
              px: { xs: 2, sm: 3 },
              py: { xs: 2, md: 3 },
            }}
          >
            {children}
          </Box>
        </Box>
        <Footer />
        <AssistantWidget />
      </Box>
    </UserContext.Provider>
  );
}

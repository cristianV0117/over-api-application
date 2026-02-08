"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { UserContext } from "@/context/userContext";
import Navbar from "@/components/menus/Navbar";
import Sidebar from "@/components/menus/Sidebar";
import Footer from "@/components/Footer";
import AssistantWidget from "@/components/assistant/AssistantWidget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authorized, checking, user } = useAuthGuard();

  if (checking || !authorized) return null;

  return (
    <UserContext.Provider value={user}>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <div className="d-flex flex-grow-1">
          <Sidebar />
          <main className="flex-grow-1 p-4 bg-dark text-white">{children}</main>
        </div>
        <Footer />
        <AssistantWidget />
      </div>
    </UserContext.Provider>
  );
}

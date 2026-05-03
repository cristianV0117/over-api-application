import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, Zoom } from "react-toastify";
import AppProviders from "@/components/providers/AppProviders";
import MaintenanceScreen from "@/components/maintenance/MaintenanceScreen";
import { isMaintenanceMode } from "@/lib/isMaintenanceMode";

/** Permite activar mantenimiento con MAINTENANCE_MODE sin rebuild fijado en el HTML estático. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "OVER APP",
  description: "Tareas, contabilidad y perfil en un solo lugar.",
  applicationName: "OVER APP",
  appleWebApp: {
    capable: true,
    title: "OVER APP",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const maintenance = isMaintenanceMode();

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <AppProviders>
          {maintenance ? <MaintenanceScreen /> : children}
          {!maintenance && (
            <ToastContainer
              position="top-right"
              autoClose={4000}
              transition={Zoom}
              theme="dark"
            />
          )}
        </AppProviders>
      </body>
    </html>
  );
}

// ✅ NUEVA ORGANIZACIÓN DE COMPONENTES Y CLASES

// --- layout.tsx ---
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "simple-datatables/dist/style.css";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, Zoom } from "react-toastify";

export const metadata: Metadata = {
  title: "OVER APP",
  description: "Over app application",
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
  return (
    <html lang="es" data-bs-theme="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} d-flex flex-column min-vh-100 bg-dark`}
        suppressHydrationWarning
      >
        {children}
        <ToastContainer
          position="top-right"
          autoClose={4000}
          transition={Zoom}
          theme="dark"
        />
      </body>
    </html>
  );
}

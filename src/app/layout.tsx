// ✅ NUEVA ORGANIZACIÓN DE COMPONENTES Y CLASES

// --- layout.tsx ---
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "simple-datatables/dist/style.css";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

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
    <html lang="es" data-bs-theme="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} d-flex flex-column min-vh-100 bg-dark`}
      >
        {children}
        <ToastContainer position="top-right" autoClose={3000} />
      </body>
    </html>
  );
}

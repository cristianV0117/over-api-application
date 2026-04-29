import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, Zoom } from "react-toastify";
import AppProviders from "@/components/providers/AppProviders";

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
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <AppProviders>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={4000}
            transition={Zoom}
            theme="dark"
          />
        </AppProviders>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-cristian",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Cristian Vásquez — Backend & FullStack Developer",
  description:
    "Perfil de Cristian Vásquez: desarrollo backend, DDD, NestJS, Laravel y más.",
};

export default function CristianDevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={plusJakarta.variable}>{children}</div>;
}

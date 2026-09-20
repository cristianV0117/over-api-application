import { notFound } from "next/navigation";
import PortfolioRenderer from "@/components/portfolio/PortfolioRenderer";
import type { PortfolioConfig } from "@/lib/portfolio/types";

const RESERVED = new Set([
  "dashboard",
  "cristiandev",
  "login",
  "register",
  "google-callback",
  "reset-password",
  "api",
  "favicon.ico",
  "portafolio",
]);

async function loadPortfolio(slug: string): Promise<PortfolioConfig | null> {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${base}/portfolio/public/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const normalized = slug.trim().toLowerCase();

  if (RESERVED.has(normalized)) notFound();

  const config = await loadPortfolio(normalized);
  if (!config) notFound();

  return <PortfolioRenderer config={config} />;
}

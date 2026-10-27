import type { NextConfig } from "next";

const backend = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  transpilePackages: ["apexcharts", "react-apexcharts", "@react-pdf/renderer"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob:",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              `connect-src 'self' wss: ws:${backend ? ` ${backend}` : ""}`,
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
              "frame-src 'self' blob: https://over-api-application-production.up.railway.app https://gloomi-production.up.railway.app",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

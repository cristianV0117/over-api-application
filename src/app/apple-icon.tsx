import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #5b21b6 0%, #7c3aed 45%, #c94b6d 100%)",
          fontSize: 88,
          fontWeight: 800,
          color: "#ffffff",
          fontFamily:
            'ui-rounded, "system-ui", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        O
      </div>
    ),
    { ...size }
  );
}

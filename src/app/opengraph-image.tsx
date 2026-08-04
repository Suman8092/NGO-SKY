import { ImageResponse } from "next/og";

export const alt = "Ashaaya Foundation — Hope, made practical";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        color: "#f8f7f1",
        background: "linear-gradient(135deg, #071f1b 0%, #0f766e 70%, #2a9d7f 100%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 28, fontWeight: 700 }}>
        <div style={{ width: 24, height: 24, borderRadius: 99, background: "#f59e0b" }} />
        ASHAAYA FOUNDATION
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
        <div style={{ fontSize: 82, lineHeight: 0.98, fontWeight: 700, letterSpacing: "-4px" }}>
          Hope, made practical.
        </div>
        <div style={{ marginTop: 30, fontSize: 28, opacity: 0.82 }}>
          Locally led solutions. Radically transparent giving.
        </div>
      </div>
    </div>,
    size,
  );
}

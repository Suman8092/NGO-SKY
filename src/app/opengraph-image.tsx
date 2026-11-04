import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Skymeredian Foundation website publication status";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(
    join(process.cwd(), "public/brand/foundation-logo-transparent.png"),
  );
  const logoSource = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        color: "#10233d",
        background:
          "linear-gradient(135deg, #eef6ff 0%, #ffffff 65%, #edf7e8 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontSize: 28,
          fontWeight: 700,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 450,
            height: 150,
            position: "relative",
            overflow: "hidden",
            background: "transparent",
            borderRadius: 8,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSource}
            alt="Skymeredian Foundation"
            width={450}
            height={150}
            style={{
              width: 450,
              height: 150,
              objectFit: "contain",
            }}
          />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
        <div
          style={{
            fontSize: 82,
            lineHeight: 0.98,
            fontWeight: 700,
            letterSpacing: "-4px",
          }}
        >
          Public information under review.
        </div>
        <div style={{ marginTop: 30, fontSize: 28, opacity: 0.82 }}>
          Each online service reports its current availability.
        </div>
      </div>
    </div>,
    size,
  );
}

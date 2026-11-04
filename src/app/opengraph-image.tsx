import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Skymeredian Foundation website publication status";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(
    join(process.cwd(), "public/brand/foundation-logo.png"),
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
        color: "#f8f7f1",
        background:
          "linear-gradient(135deg, #071f1b 0%, #0f766e 70%, #2a9d7f 100%)",
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
            width: 170,
            height: 162,
            position: "relative",
            overflow: "hidden",
            background: "white",
            borderRadius: 8,
          }}
        >
          {/* The source includes whitespace; preserve the complete logo within the visible frame. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSource}
            alt="Skymeredian Foundation"
            width={300}
            height={300}
            style={{
              position: "absolute",
              width: 300,
              height: 300,
              left: -64.5,
              top: -56,
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

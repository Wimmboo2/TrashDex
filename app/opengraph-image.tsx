import { ImageResponse } from "next/og";

export const alt = "TrashDex. Scan one waste item and get Indonesia disposal guidance.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f5ead8",
          color: "#201e1d",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#8c491a",
            }}
          />
          <div style={{ fontSize: 36 }}>TrashDex</div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            lineHeight: 1.05,
            maxWidth: 920,
          }}
        >
          Scan it. Sort it. Check local rules.
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#6b6257" }}>
          Waste sorting for Indonesia. One item at a time.
        </div>
      </div>
    ),
    { ...size },
  );
}

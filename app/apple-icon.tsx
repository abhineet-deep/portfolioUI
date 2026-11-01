import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same monogram as app/icon.svg, rendered to PNG for iOS home screens.
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
          background: "#0F1522",
          color: "#3DD6C6",
          fontSize: 96,
          fontWeight: 700,
          letterSpacing: -4,
        }}
      >
        ad
      </div>
    ),
    size,
  );
}

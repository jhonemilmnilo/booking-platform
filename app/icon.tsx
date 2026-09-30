import { ImageResponse } from "next/og"
import { getSystemSetting } from "@/lib/settings"

export const runtime = "nodejs"

// Standard high-definition favicon square dimensions
export const size = {
  width: 64,
  height: 64,
}
export const contentType = "image/png"

export default async function Icon() {
  const brandLogo = await getSystemSetting("brand_logo", "")

  if (brandLogo) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brandLogo}
            alt="Favicon"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      ),
      {
        ...size,
      }
    )
  }

  // Fallback luxury gold crest if no custom logo is uploaded
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#16171b",
          borderRadius: "50%",
        }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 100 100"
          fill="#D4AF37"
        >
          <path d="M50 5 L85 25 L85 65 L50 95 L15 65 L15 25 Z" fill="none" stroke="#D4AF37" strokeWidth="3" />
          <circle cx="50" cy="48" r="10" fill="#D4AF37" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}

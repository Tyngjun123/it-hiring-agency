import { ImageResponse } from "next/og"

// Branded preview image shown when the site link is shared (WhatsApp, X, LinkedIn, etc.)
export const alt = "TechireX — Find IT Jobs in Malaysia"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1C1C1E",
          backgroundImage:
            "radial-gradient(circle at 50% 36%, rgba(249,115,22,0.20), rgba(28,28,30,0) 55%)",
        }}
      >
        {/* Logo lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          {/* Orange tile + white climber */}
          <div
            style={{
              width: 152,
              height: 152,
              borderRadius: 42,
              backgroundColor: "#F97316",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 22px 55px rgba(249,115,22,0.45)",
            }}
          >
            <svg width="94" height="94" viewBox="0 0 40 40" fill="none">
              <rect x="4" y="33.5" width="9" height="4" rx="1.5" fill="rgba(255,255,255,0.5)" />
              <rect x="14.5" y="30" width="9" height="7.5" rx="1.5" fill="rgba(255,255,255,0.75)" />
              <rect x="25" y="25.5" width="9" height="12" rx="1.5" fill="#fff" />
              <circle cx="19" cy="9" r="4.2" fill="#fff" />
              <path d="M19 13.4 L17.5 21.5" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M19 15.2 L27 10.5" stroke="#fff" strokeWidth="3.3" strokeLinecap="round" />
              <path d="M19 15.2 L12 18.5" stroke="#fff" strokeWidth="3.3" strokeLinecap="round" />
              <path d="M17.5 21.5 L25 24.5" stroke="#fff" strokeWidth="3.3" strokeLinecap="round" />
              <path d="M17.5 21.5 L13 28" stroke="#fff" strokeWidth="3.3" strokeLinecap="round" />
            </svg>
          </div>

          {/* Wordmark */}
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#fff",
            }}
          >
            <span style={{ display: "flex" }}>Techire</span>
            <span style={{ display: "flex", color: "#F97316" }}>X</span>
          </div>
        </div>

        {/* Subtitle */}
        <div style={{ display: "flex", marginTop: 36, fontSize: 42, color: "#C7C3B8" }}>
          Find IT Jobs in Malaysia
        </div>
      </div>
    ),
    { ...size },
  )
}

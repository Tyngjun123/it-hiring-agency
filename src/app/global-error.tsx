"use client"

import { useEffect } from "react"
import { LogoMark } from "@/components/brand"

// Catches errors thrown in the root layout (e.g. Navbar DB query fails)
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Global Error]", error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#FAFAF8" }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "40px",
          }}>
            <div style={{
              width: 40, height: 40,
              borderRadius: 11,
              background: "#F97316",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 15px rgba(249,115,22,0.35)",
            }}>
              <LogoMark
                size={25}
                figure="#fff"
                steps={["rgba(255,255,255,.5)", "rgba(255,255,255,.75)", "#fff"]}
              />
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#1C1C1E", letterSpacing: "-0.03em" }}>
              Techire<span style={{ color: "#F97316" }}>X</span>
            </span>
          </div>

          <div style={{
            width: "100%", maxWidth: 420,
            background: "white",
            border: "1px solid #EEEBE3",
            borderRadius: 22,
            padding: "40px 40px",
            textAlign: "center",
            boxShadow: "0 1px 2px rgba(28,28,30,0.03), 0 20px 50px rgba(28,28,30,0.08)",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "#FFF7ED",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: 28,
            }}>
              🔧
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1C1C1E", margin: "0 0 8px" }}>
              We&apos;ll be right back
            </h1>
            <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.6, margin: "0 0 28px" }}>
              TechireX is undergoing a quick bit of maintenance. We&apos;ll be back up shortly.
            </p>

            <button
              onClick={reset}
              style={{
                width: "100%",
                background: "#F97316",
                color: "white",
                border: "none",
                borderRadius: 12,
                padding: "14px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
              }}>
              Try again
            </button>
          </div>

          <p style={{ marginTop: 28, fontSize: 13, color: "#B6B2A8" }}>
            Questions? Email us at{" "}
            <a href="mailto:support@techirex.com" style={{ color: "#F97316" }}>
              support@techirex.com
            </a>
          </p>
        </div>
      </body>
    </html>
  )
}

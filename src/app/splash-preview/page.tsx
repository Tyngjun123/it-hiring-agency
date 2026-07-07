// Standalone, unlinked preview of the "Frame 4 · steps loader" splash concept —
// orange background variant (white loader/climber). This does NOT wire a splash
// into the real app; it's just viewable at /splash-preview to judge the design.
export const metadata = {
  title: "Splash preview — TechireX",
  robots: { index: false, follow: false },
}

export default function SplashPreviewPage() {
  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{ background: "linear-gradient(170deg,#F97316 0%,#EA580C 55%,#C2410C 100%)" }}
    >
      <style>{`@keyframes stepglow { 0%,100% { opacity:.35 } 50% { opacity:1 } }`}</style>

      {/* Subtle diagonal texture */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,.06) 0 2px, transparent 2px 16px)" }}
      />

      {/* Centered wordmark */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", letterSpacing: "-.035em" }}>
          StackTalent<span style={{ color: "#1C1C1E" }}>x</span>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.85)", fontWeight: 500 }}>
          Find your next role in tech
        </div>
      </div>

      {/* Climber climbing the loader steps — white on orange */}
      <div className="absolute left-0 right-0 flex flex-col items-center" style={{ bottom: 64, gap: 18 }}>
        <div className="relative flex items-end" style={{ gap: 8, height: 48 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: "#fff", animation: "stepglow 1.5s infinite 0s" }} />
          <div style={{ width: 22, height: 34, borderRadius: 6, background: "#fff", animation: "stepglow 1.5s infinite .25s" }} />
          <div style={{ width: 22, height: 46, borderRadius: 6, background: "#fff", animation: "stepglow 1.5s infinite .5s" }} />
          <svg width="34" height="34" viewBox="0 0 40 40" fill="none" style={{ position: "absolute", right: -26, top: -20 }}>
            <circle cx="19" cy="11" r="5" fill="#fff" />
            <path d="M19 17 L17.5 26" stroke="#fff" strokeWidth="4.4" strokeLinecap="round" />
            <path d="M19 19 L27 12" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
            <path d="M19 19 L11 20" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
            <path d="M17.5 26 L25 31" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
            <path d="M17.5 26 L13 33" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.75)", letterSpacing: ".04em" }}>stacktalentx.com</div>
      </div>
    </div>
  )
}

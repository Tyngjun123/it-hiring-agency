// StackTalentx brand assets — climber-on-ascending-stack logo.
// Light contexts: dark tile + orange figure. Dark/orange contexts: orange tile + white figure.

export const BRAND_NAME = "StackTalentx"

const LIGHT_STEPS: [string, string, string] = [
  "rgba(255,255,255,.32)",
  "rgba(255,255,255,.55)",
  "rgba(255,255,255,.85)",
]
const DARK_STEPS: [string, string, string] = [
  "rgba(255,255,255,.5)",
  "rgba(255,255,255,.75)",
  "#fff",
]

// The climber rising up the ascending stack.
export function LogoMark({
  size = 24,
  figure = "#F97316",
  steps = LIGHT_STEPS,
}: {
  size?: number
  figure?: string
  steps?: [string, string, string]
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="4" y="33.5" width="9" height="4" rx="1.5" fill={steps[0]} />
      <rect x="14.5" y="30" width="9" height="7.5" rx="1.5" fill={steps[1]} />
      <rect x="25" y="25.5" width="9" height="12" rx="1.5" fill={steps[2]} />
      <circle cx="19" cy="9" r="4.2" fill={figure} />
      <path d="M19 13.4 L17.5 21.5" stroke={figure} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M19 15.2 L27 10.5" stroke={figure} strokeWidth="3.3" strokeLinecap="round" />
      <path d="M19 15.2 L12 18.5" stroke={figure} strokeWidth="3.3" strokeLinecap="round" />
      <path d="M17.5 21.5 L25 24.5" stroke={figure} strokeWidth="3.3" strokeLinecap="round" />
      <path d="M17.5 21.5 L13 28" stroke={figure} strokeWidth="3.3" strokeLinecap="round" />
    </svg>
  )
}

// The rounded square tile that holds the mark.
export function LogoTile({
  size = 32,
  variant = "light",
  className = "",
}: {
  size?: number
  variant?: "light" | "onDark"
  className?: string
}) {
  const isDark = variant === "onDark"
  return (
    <div
      className={`flex items-center justify-center shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        background: isDark ? "#F97316" : "#1C1C1E",
        boxShadow: isDark ? "0 6px 15px rgba(249,115,22,.35)" : "0 4px 11px rgba(28,28,30,.22)",
      }}
    >
      <LogoMark
        size={Math.round(size * 0.62)}
        figure={isDark ? "#fff" : "#F97316"}
        steps={isDark ? DARK_STEPS : LIGHT_STEPS}
      />
    </div>
  )
}

// "StackTalent" + accent "x".
export function Wordmark({
  className = "",
  xColor = "#F97316",
}: {
  className?: string
  xColor?: string
}) {
  return (
    <span className={className}>
      StackTalent<span style={{ color: xColor }}>x</span>
    </span>
  )
}

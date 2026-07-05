// Per-type icon tile (colour + glyph) for notifications. No hooks → usable in
// both server and client components.
const MAP: Record<string, { bg: string; stroke: string; path: React.ReactNode }> = {
  NEW_APPLICANT: {
    bg: "#EFF6FF", stroke: "#1D4ED8",
    path: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /></>,
  },
  APPLICATION_STATUS: {
    bg: "#FEF3C7", stroke: "#B45309",
    path: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  },
  JOB_RECOMMENDATION: {
    bg: "#FFF1E1", stroke: "#C2410C",
    path: <><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></>,
  },
  JOB_EXPIRING: {
    bg: "#FEF3C7", stroke: "#B45309",
    path: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  },
  GENERAL: {
    bg: "#F6F4EE", stroke: "#6B7280",
    path: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
  },
}

export default function NotificationIcon({ type, size = 42 }: { type: string; size?: number }) {
  const c = MAP[type] ?? MAP.GENERAL
  return (
    <div className="rounded-[12px] flex items-center justify-center shrink-0"
      style={{ width: size, height: size, background: c.bg }}>
      <svg width={Math.round(size * 0.48)} height={Math.round(size * 0.48)} viewBox="0 0 24 24"
        fill="none" stroke={c.stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {c.path}
      </svg>
    </div>
  )
}

// Editable About-page content (beyond tagline/hero/body). Stored in cms_content
// as JSON (values/team) or plain strings (headings). Fallbacks match the live
// copy so the page is unchanged until edited.

export type Value = { icon: string; title: string; body: string }
export type Member = { initials: string; name: string; role: string }

export const ABOUT_MISSION_HEADING_DEFAULT = "Make finding and hiring tech talent in Malaysia feel effortless."
export const ABOUT_JOIN_HEADING_DEFAULT = "Want to join our team?"
export const ABOUT_JOIN_BODY_DEFAULT =
  "We're always looking for talented people to help build Malaysia's IT job platform. Tell us how you'd like to contribute."

export const ABOUT_VALUES_DEFAULT: Value[] = [
  { icon: "🇲🇾", title: "Built for Malaysia", body: "We know the local market — Klang Valley commutes, EPF contributions, ringgit salary ranges. No generic job board nonsense." },
  { icon: "🚫", title: "No recruiter spam", body: "Candidates control who can contact them. Employers post directly — no middlemen inflating salaries and ghosting candidates." },
  { icon: "⚡", title: "Fast & focused", body: "Post a job in 3 minutes. Apply in one click. Track status in real time. We cut every step that doesn't add value." },
  { icon: "🔍", title: "IT-only, always", body: "Every listing, every filter, every tag is built around tech roles. Developers, PMs, QA, DevOps — this is your board." },
]

export const ABOUT_TEAM_DEFAULT: Member[] = [
  { initials: "MT", name: "Marcus Tan", role: "Founder & CEO" },
  { initials: "⚙", name: "Engineering", role: "Backend · Frontend · DevOps" },
  { initials: "📈", name: "Growth", role: "Marketing · Partnerships" },
]

// Fixed colour palette for team cards (kept in code so the design is stable).
export const TEAM_COLORS = [
  { bg: "#FFF1E1", fg: "#C2410C" },
  { bg: "#EFF6FF", fg: "#1D4ED8" },
  { bg: "#F0FDF4", fg: "#16A34A" },
]

export function parseList<T>(json: string | undefined | null, fallback: T[], valid: (x: unknown) => boolean): T[] {
  if (!json) return fallback
  try {
    const parsed = JSON.parse(json)
    if (Array.isArray(parsed) && parsed.every(valid)) return parsed as T[]
  } catch {
    /* fall through */
  }
  return fallback
}

// Resolves the canonical site origin for absolute URLs (sitemap, OG tags, etc.)
// Priority: explicit NEXT_PUBLIC_SITE_URL → Vercel production domain → localhost.
// Always returns a valid, parseable URL — falls back if an env value is malformed.
const FALLBACK_URL = "https://it-hiring-agency.vercel.app"

export function getSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL?.trim(),
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`
      : undefined,
  ]

  for (const candidate of candidates) {
    if (!candidate) continue
    const cleaned = candidate.replace(/\/$/, "")
    try {
      // Validate — throws if malformed
      new URL(cleaned)
      return cleaned
    } catch {
      // try next candidate
    }
  }

  return FALLBACK_URL
}

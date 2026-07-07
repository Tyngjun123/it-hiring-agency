// Editable pricing-plan fields (name/price/copy/features). The CTA, highlight,
// badge and enable-flags stay in the pricing page (design/logic). Admins edit
// these via the Content CMS; stored as JSON in cms_content under `pricing_plans`.

export type EditablePlan = {
  name: string
  price: string
  period: string
  tagline: string
  bestFor: string
  features: string[]
}

export const PRICING_PLANS_DEFAULT: EditablePlan[] = [
  {
    name: "Free",
    price: "RM 0",
    period: "Forever free",
    tagline: "Try the platform with no commitment.",
    bestFor: "Companies just getting started",
    features: [
      "Up to 10 active job listings",
      "Unlimited applicants per listing",
      "Application inbox with status tracking",
      "Email notifications on new applicants",
      "Company profile page",
    ],
  },
  {
    name: "Pro",
    price: "RM 200",
    period: "per month",
    tagline: "Perfect for startups & small tech teams hiring regularly.",
    bestFor: "Companies hiring 1–3 roles/month",
    features: [
      "Up to 30 job postings per month",
      "Monthly curated IT talent list (10–20 candidates)",
      "Access to active candidate updates",
      "System feedback channel",
    ],
  },
  {
    name: "Max",
    price: "RM 400",
    period: "per month",
    tagline: "Built for teams that want continuous hiring support.",
    bestFor: "Companies actively scaling tech teams",
    features: [
      "Unlimited job postings",
      "50–80 curated IT talents monthly",
      "Priority access to new candidates (before Pro users)",
      "Talent matching priority queue",
      "10 job boost credits / month",
      "Dedicated account manager support",
    ],
  },
]

// Parse the CMS JSON of plans, falling back to defaults if missing/invalid.
export function parsePlans(json: string | undefined | null, fallback: EditablePlan[]): EditablePlan[] {
  if (!json) return fallback
  try {
    const parsed = JSON.parse(json)
    if (Array.isArray(parsed) && parsed.every((p) => p && typeof p.name === "string" && Array.isArray(p.features))) {
      return parsed as EditablePlan[]
    }
  } catch {
    /* fall through */
  }
  return fallback
}

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getSiteConfig } from "@/lib/site-config"
import { getCmsMap } from "@/lib/cms"
import { buildPageMetadata, getPageSchema } from "@/lib/seo"
import { RawJsonLd } from "@/components/json-ld"
import type { Metadata } from "next"
import { PRICING_FAQS, parseFaqs } from "@/data/faqs"
import { PRICING_PLANS_DEFAULT, parsePlans } from "@/data/plans"

type Plan = {
  name: string
  price: string
  period: string
  tagline: string
  features: string[]
  bestFor: string
  cta: { label: string; href: string }
  highlight?: boolean
  badge?: string
  dark?: boolean
  flag?: "pro" | "max" // gated behind a site-config enable flag; "Coming soon" until on
}

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "RM 0",
    period: "Forever free",
    tagline: "Try the platform with no commitment.",
    features: [
      "Up to 10 active job listings",
      "Unlimited applicants per listing",
      "Application inbox with status tracking",
      "Email notifications on new applicants",
      "Company profile page",
    ],
    bestFor: "Companies just getting started",
    cta: { label: "Get started free", href: "/register?role=COMPANY" },
  },
  {
    name: "Pro",
    price: "RM 200",
    period: "per month",
    tagline: "Perfect for startups & small tech teams hiring regularly.",
    features: [
      "Up to 30 job postings per month",
      "Monthly curated IT talent list (10–20 candidates)",
      "Access to active candidate updates",
      "System feedback channel",
    ],
    bestFor: "Companies hiring 1–3 roles/month",
    cta: { label: "Upgrade to Pro", href: "/company/billing" },
    highlight: true,
    badge: "Most popular",
    flag: "pro",
  },
  {
    name: "Max",
    price: "RM 400",
    period: "per month",
    tagline: "Built for teams that want continuous hiring support.",
    features: [
      "Unlimited job postings",
      "50–80 curated IT talents monthly",
      "Priority access to new candidates (before Pro users)",
      "Talent matching priority queue",
      "10 job boost credits / month",
      "Dedicated account manager support",
    ],
    bestFor: "Companies actively scaling tech teams",
    cta: { label: "Choose Max", href: "/company/billing" },
    dark: true,
    flag: "max",
  },
]

const BOOST_FEATURES = [
  "Pin to top of search results for 30 days",
  "Featured badge on listing",
  "Homepage banner spotlight (optional)",
  "Per listing — no subscription needed",
]

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("pricing")
}

export default async function PricingPage() {
  const config = await getSiteConfig()
  const cms = await getCmsMap()
  const pricingSchema = await getPageSchema("pricing")
  const pricingFaqs = parseFaqs(cms["pricing_faqs"], PRICING_FAQS)
  // Merge CMS-editable copy over the base plans (CTA/badge/flags stay in code).
  const editablePlans = parsePlans(cms["pricing_plans"], PRICING_PLANS_DEFAULT)
  const plans = PLANS.map((base, i) => ({ ...base, ...(editablePlans[i] ?? {}) }))
  const boost = {
    title: cms["boost_title"] ?? "Boost a Job Listing",
    desc: cms["boost_desc"] ?? "Pin any listing to the top of search results for 30 days. Max plan includes 10 boost credits monthly.",
    price: cms["boost_price"] ?? "RM 100",
    period: cms["boost_period"] ?? "per listing / 30 days",
    features: cms["boost_features"]?.split("\n").map((s) => s.trim()).filter(Boolean) ?? BOOST_FEATURES,
  }
  const maxPlanEnabled = config?.maxPlanEnabled ?? false
  const proPlanEnabled = config?.proPlanEnabled ?? false

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <RawJsonLd json={pricingSchema} />
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-16 space-y-12">

        <div className="text-center space-y-2">
          <h1 className="text-[32px] font-extrabold text-[#1C1C1E] tracking-[-0.03em]">Simple, transparent pricing</h1>
          <p className="text-[#6B7280]">Start free. Upgrade when you&apos;re ready to hire faster.</p>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => {
            const locked =
              (plan.flag === "pro" && !proPlanEnabled) ||
              (plan.flag === "max" && !maxPlanEnabled)
            return (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-7 ${
                plan.dark
                  ? "bg-[#1C1C1E] text-white"
                  : plan.highlight
                    ? "bg-white border-2 border-[#F97316] shadow-[0_18px_44px_rgba(249,115,22,0.16)]"
                    : "bg-white border border-[#EAE8E2]"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F97316] text-white text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full shadow-[0_4px_10px_rgba(249,115,22,0.35)]">
                  {plan.badge}
                </div>
              )}

              <div>
                <p className={`text-xs font-bold uppercase tracking-wide ${plan.dark ? "text-[#F9B179]" : "text-[#C2410C]"}`}>
                  {plan.name}
                </p>
                <p className={`text-[34px] font-extrabold mt-1 ${plan.dark ? "text-white" : "text-[#1C1C1E]"}`}>{plan.price}</p>
                <p className={`text-sm mt-1 ${plan.dark ? "text-[#9CA3AF]" : "text-[#9CA3AF]"}`}>{plan.period}</p>
                <p className={`text-[13.5px] leading-relaxed mt-3 ${plan.dark ? "text-[#C7C3B8]" : "text-[#6B7280]"}`}>{plan.tagline}</p>
              </div>

              <div className={`h-px my-5 ${plan.dark ? "bg-white/10" : "bg-[#F0EEE8]"}`} />

              <p className={`text-[11px] font-bold uppercase tracking-wide mb-3 ${plan.dark ? "text-[#9CA3AF]" : "text-[#9A968C]"}`}>
                Includes
              </p>
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2.5 text-[13.5px] ${plan.dark ? "text-[#E5E2DA]" : "text-[#3A3A3C]"}`}>
                    <span className={`mt-0.5 shrink-0 font-bold ${plan.dark ? "text-[#F9B179]" : "text-[#F97316]"}`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <p className={`text-[12.5px] mt-5 mb-5 ${plan.dark ? "text-[#9CA3AF]" : "text-[#9A968C]"}`}>
                <span className="font-bold">Best for:</span> {plan.bestFor}
              </p>

              {locked ? (
                <div className="mt-auto">
                  <button
                    type="button"
                    disabled
                    className={`w-full rounded-md py-2 text-sm font-medium cursor-not-allowed ${
                      plan.dark ? "bg-white/10 text-white/40" : "bg-[#F4F2EC] text-[#9CA3AF]"
                    }`}
                  >
                    Coming soon
                  </button>
                </div>
              ) : (
                <Link href={plan.cta.href} className="mt-auto">
                  {plan.highlight ? (
                    <Button className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white border-0">{plan.cta.label}</Button>
                  ) : plan.dark ? (
                    <Button className="w-full bg-white hover:bg-[#F4F2EC] text-[#1C1C1E] border-0">{plan.cta.label}</Button>
                  ) : (
                    <Button variant="outline" className="w-full border-[#E6E2D9] hover:border-[#F97316] hover:text-[#F97316]">{plan.cta.label}</Button>
                  )}
                </Link>
              )}
            </div>
            )
          })}
        </div>

        {/* Boost add-on */}
        <div className="bg-white border border-[#FBDDBE] rounded-2xl p-8 space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-bold text-[#C2410C] uppercase tracking-wide">Add-on · No subscription needed</p>
              <h2 className="text-xl font-extrabold text-[#1C1C1E] mt-1">{boost.title}</h2>
              <p className="text-sm text-[#6B7280] mt-1">{boost.desc}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-extrabold text-[#1C1C1E]">{boost.price}</p>
              <p className="text-sm text-[#9CA3AF]">{boost.period}</p>
            </div>
          </div>
          <ul className="grid sm:grid-cols-2 gap-2.5">
            {boost.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-[#3A3A3C]">
                <span className="text-[#F97316] mt-0.5 shrink-0">★</span> {f}
              </li>
            ))}
          </ul>
          <Link href="/company/jobs">
            <Button variant="outline" className="border-[#FBDDBE] hover:bg-[#FFF7ED] hover:text-[#C2410C]">
              Boost a listing →
            </Button>
          </Link>
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1C1C1E]">Common questions</h2>
          {pricingFaqs.map(({ q, a }) => (
            <div key={q} className="bg-white border border-[#EEEBE3] rounded-xl p-5">
              <p className="font-bold text-[#1C1C1E] text-sm">{q}</p>
              <p className="text-sm text-[#6B7280] mt-1.5">{a}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-[#6B7280]">Questions? <Link href="/contact" className="text-[#F97316] hover:underline font-semibold">Contact us →</Link></p>
        </div>

      </main>
      <Footer />
    </div>
  )
}

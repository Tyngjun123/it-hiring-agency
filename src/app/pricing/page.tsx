import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const FREE_FEATURES = [
  "Up to 10 active job listings",
  "Unlimited applicants per listing",
  "Application inbox with status tracking",
  "Email notifications on new applicants",
  "Company profile page",
]

const PRO_FEATURES = [
  "Unlimited active job listings",
  "Everything in Free",
  "Priority support",
  "Early access to new features",
]

const BOOST_FEATURES = [
  "Pin to top of search results for 30 days",
  "Featured badge on listing",
  "Homepage banner spotlight (optional)",
  "Per listing — no subscription needed",
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-16 space-y-12">

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Simple, transparent pricing</h1>
          <p className="text-gray-500">Start free. Upgrade when you&apos;re ready.</p>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Free */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Free</p>
              <p className="text-4xl font-bold text-gray-900 mt-1">RM 0</p>
              <p className="text-sm text-gray-400 mt-1">Forever free</p>
            </div>
            <ul className="space-y-2.5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="text-emerald-500 mt-0.5 shrink-0">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/register?role=COMPANY">
              <Button variant="outline" className="w-full">Get started free</Button>
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-gray-900 text-white rounded-2xl p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              Most popular
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Pro</p>
              <p className="text-4xl font-bold mt-1">RM 500</p>
              <p className="text-sm text-gray-400 mt-1">per month</p>
            </div>
            <ul className="space-y-2.5">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/company/billing">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-0">
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        </div>

        {/* Boost add-on */}
        <div className="bg-white border border-amber-200 rounded-2xl p-8 space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Add-on · No subscription needed</p>
              <h2 className="text-xl font-bold text-gray-900 mt-1">Boost a Job Listing</h2>
              <p className="text-sm text-gray-500 mt-1">Pin any listing to the top of search results for 30 days</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-bold text-gray-900">RM 100</p>
              <p className="text-sm text-gray-400">per listing / 30 days</p>
            </div>
          </div>
          <ul className="grid sm:grid-cols-2 gap-2.5">
            {BOOST_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                <span className="text-amber-500 mt-0.5 shrink-0">★</span> {f}
              </li>
            ))}
          </ul>
          <Link href="/company/jobs">
            <Button variant="outline" className="border-amber-300 hover:bg-amber-50">
              Boost a listing →
            </Button>
          </Link>
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Common questions</h2>
          {[
            { q: "How do I pay?", a: "We currently accept manual bank transfer (Maybank / CIMB). Contact us after payment with your reference number and we'll activate your plan within 1 business day." },
            { q: "Can I cancel Pro anytime?", a: "Yes. Your Pro plan runs month-to-month. Contact us before your next billing date to cancel." },
            { q: "What happens when I hit the 10-job limit on Free?", a: "Your existing listings stay active. You just can't post new ones until you upgrade to Pro or close existing listings." },
            { q: "Is the Boost add-on separate from Pro?", a: "Yes. Any company (Free or Pro) can purchase a Boost add-on for any individual listing at RM 100 for 30 days." },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white border border-gray-100 rounded-xl p-5">
              <p className="font-medium text-gray-900 text-sm">{q}</p>
              <p className="text-sm text-gray-500 mt-1.5">{a}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">Questions? <Link href="/contact" className="text-blue-600 hover:underline">Contact us →</Link></p>
        </div>

      </main>
      <Footer />
    </div>
  )
}

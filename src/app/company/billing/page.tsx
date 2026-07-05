import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { requestUpgradeToPro, requestUpgradeToMax } from "@/app/actions/boost"
import CompanyProfileRequiredModal from "@/components/company-profile-required-modal"
import { getSiteConfig } from "@/lib/site-config"

const BANK_DETAILS = {
  bank: "Maybank",
  accountName: "StackTalentx Sdn Bhd",
  accountNumber: "1234 5678 9012",
  amount: "RM 200.00",
  reference: "PRO-{your company name}",
}

const PLANS = [
  {
    key: "FREE",
    name: "Free",
    price: "RM 0",
    sub: "forever",
    features: ["Up to 10 active listings", "Standard visibility", "Email support", "Basic analytics"],
    cta: "Current plan",
    ctaStyle: "current",
  },
  {
    key: "PRO",
    name: "Pro",
    price: "RM 200",
    sub: "/ month",
    features: ["Up to 30 active listings", "Monthly curated IT talent list (10–20)", "Active candidate updates", "System feedback channel"],
    cta: "Upgrade to Pro",
    ctaStyle: "primary",
  },
  {
    key: "MAX",
    name: "Max",
    price: "RM 400",
    sub: "/ month",
    features: ["Unlimited listings", "50–80 curated talents monthly", "Priority access to new candidates", "10 job boost credits / month", "Dedicated account manager"],
    cta: "Coming soon",
    ctaStyle: "soon",
  },
]

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ requested?: string }>
}) {
  const { requested } = await searchParams
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const profile = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      jobListings: { where: { status: "ACTIVE" }, select: { id: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  })
  if (!profile) return <CompanyProfileRequiredModal />

  const config = await getSiteConfig()
  const maxPlanEnabled = config?.maxPlanEnabled ?? false
  const proPlanEnabled = config?.proPlanEnabled ?? false

  const activeCount = profile.jobListings.length
  const isPro = profile.plan === "PRO"
  const isMax = profile.plan === "MAX"
  const planLabel = isMax ? "Max" : isPro ? "Pro" : "Starter"
  const planBadge = isMax ? "MAX" : isPro ? "PRO" : "FREE"
  const slotCap = isMax ? "∞" : isPro ? "30" : "10"
  const hasPendingUpgrade = profile.payments.some(
    (p) => p.type === "SUBSCRIPTION" && p.status === "PENDING"
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-extrabold text-[#1C1C1E] tracking-tight">Billing &amp; Plan</h1>
        <p className="text-sm text-[#9CA3AF] mt-0.5">{profile.companyName}</p>
      </div>

      {requested === "1" && (
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-3 text-sm text-[#15803D] font-semibold">
          Upgrade request received — we'll activate your Pro plan within 1 business day after payment confirmation.
        </div>
      )}

      {/* Current plan — dark gradient card */}
      <div className="rounded-2xl p-6 text-white" style={{ background: "linear-gradient(135deg,#1C1C1E 0%,#2A2A2D 100%)" }}>
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1">Current plan</p>
            <h2 className="text-[28px] font-extrabold tracking-tight">{planLabel}</h2>
          </div>
          <span className={`text-[12px] px-3 py-1.5 rounded-full font-bold shrink-0 mt-1 ${
            isPro || isMax ? "bg-[#F97316]/20 text-[#FB923C] border border-[#F97316]/30" : "bg-white/10 text-white/70 border border-white/10"
          }`}>
            {planBadge}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/8 rounded-[12px] px-4 py-3.5">
            <p className="text-[11px] text-white/50 font-bold uppercase tracking-wider mb-1">Active jobs</p>
            <p className="text-[22px] font-extrabold">{activeCount}<span className="text-[14px] text-white/50 font-medium ml-1">/ {slotCap}</span></p>
          </div>
          <div className="bg-white/8 rounded-[12px] px-4 py-3.5">
            <p className="text-[11px] text-white/50 font-bold uppercase tracking-wider mb-1">Renewal</p>
            <p className="text-[16px] font-extrabold">
              {(isPro || isMax) && profile.billingStart
                ? new Date(profile.billingStart).toLocaleDateString("en-MY", { day: "numeric", month: "short" })
                : "—"}
            </p>
          </div>
        </div>

        {!isPro && !isMax && (
          <div className="pt-5 border-t border-white/10">
            {!proPlanEnabled ? (
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/50 font-semibold text-center">
                Paid plans coming soon — everything&apos;s free for now 🎉
              </div>
            ) : hasPendingUpgrade ? (
              <div className="bg-[#FDE68A]/10 border border-[#FDE68A]/30 rounded-xl px-4 py-3 text-sm text-[#FDE68A] font-semibold">
                Upgrade request pending — activation within 1 business day.
              </div>
            ) : (
              <form action={requestUpgradeToPro}>
                <button type="submit"
                  className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-[15px] py-3.5 rounded-[12px] shadow-[0_8px_20px_rgba(249,115,22,0.4)] transition-colors">
                  Upgrade to Pro — RM 200/month
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Plans grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent =
            (plan.key === "FREE" && !isPro && !isMax) ||
            (plan.key === "PRO" && isPro) ||
            (plan.key === "MAX" && isMax)
          return (
            <div key={plan.key}
              className={`bg-white border rounded-2xl p-5 relative shadow-[0_1px_2px_rgba(28,28,30,0.03),0_6px_16px_rgba(28,28,30,0.05)] ${
                isCurrent ? "border-[#F97316] ring-1 ring-[#F97316]/20" : "border-[#EEEBE3]"
              }`}>
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F97316] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Current
                </span>
              )}
              <p className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">{plan.name}</p>
              <div className="flex items-end gap-1 mb-4">
                <span className="text-[24px] font-extrabold text-[#1C1C1E]">{plan.price}</span>
                <span className="text-[13px] text-[#9CA3AF] mb-0.5">{plan.sub}</span>
              </div>
              <ul className="space-y-2 mb-5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-[#3A3A3C]">
                    <span className="w-4 h-4 rounded-full bg-[#FFF7ED] text-[#F97316] flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <div className="w-full py-2.5 rounded-[10px] text-center text-[13.5px] font-bold text-[#9CA3AF] bg-[#F4F2EC]">
                  Current plan
                </div>
              ) : plan.key === "PRO" && !isPro && !isMax ? (
                proPlanEnabled ? (
                  hasPendingUpgrade ? (
                    <div className="w-full py-2.5 rounded-[10px] text-center text-[13.5px] font-bold text-[#D97706] bg-[#FFFBEB] border border-[#FDE68A]">
                      Pending…
                    </div>
                  ) : (
                    <form action={requestUpgradeToPro}>
                      <button type="submit"
                        className="w-full py-2.5 rounded-[10px] text-[13.5px] font-bold text-white bg-[#F97316] hover:bg-[#EA580C] transition-colors shadow-[0_4px_10px_rgba(249,115,22,0.3)]">
                        Upgrade to Pro
                      </button>
                    </form>
                  )
                ) : (
                  <div className="w-full py-2.5 rounded-[10px] text-center text-[13.5px] font-bold text-[#9CA3AF] bg-[#F4F2EC] cursor-not-allowed">
                    Coming soon
                  </div>
                )
              ) : plan.key === "MAX" && !isMax ? (
                maxPlanEnabled ? (
                  hasPendingUpgrade ? (
                    <div className="w-full py-2.5 rounded-[10px] text-center text-[13.5px] font-bold text-[#D97706] bg-[#FFFBEB] border border-[#FDE68A]">
                      Pending…
                    </div>
                  ) : (
                    <form action={requestUpgradeToMax}>
                      <button type="submit"
                        className="w-full py-2.5 rounded-[10px] text-[13.5px] font-bold text-white bg-[#F97316] hover:bg-[#EA580C] transition-colors shadow-[0_4px_10px_rgba(249,115,22,0.3)]">
                        Upgrade to Max
                      </button>
                    </form>
                  )
                ) : (
                  <div className="w-full py-2.5 rounded-[10px] text-center text-[13.5px] font-bold text-[#9CA3AF] bg-[#F4F2EC] cursor-not-allowed">
                    Coming soon
                  </div>
                )
              ) : (
                <div className="w-full py-2.5 rounded-[10px] text-center text-[13.5px] font-bold text-[#C4BFB5] bg-[#F8F6F1]">
                  —
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Payment method / bank details — only when Pro is purchasable */}
      {!isPro && !isMax && proPlanEnabled && (
        <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[10px] bg-[#F4F2EC] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#3A3A3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <path d="M2 10h20"/>
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-extrabold text-[#1C1C1E]">Payment instructions</p>
              <p className="text-[12px] text-[#9CA3AF]">Bank transfer</p>
            </div>
          </div>
          <ol className="text-[13.5px] text-[#6B7280] space-y-2 list-decimal list-inside mb-5">
            <li>Click <strong className="text-[#1C1C1E]">Upgrade to Pro</strong> to register your request</li>
            <li>Transfer <strong className="text-[#1C1C1E]">RM 200</strong> to the account below</li>
            <li>Email receipt to <a href="mailto:support@stacktalentx.com" className="text-[#F97316] hover:underline">support@stacktalentx.com</a></li>
            <li>We'll activate within 1 business day</li>
          </ol>
          <div className="bg-[#FAFAF8] border border-[#EEEBE3] rounded-[12px] p-4 font-mono text-[13px] space-y-2">
            {[
              ["Bank", BANK_DETAILS.bank],
              ["Name", BANK_DETAILS.accountName],
              ["Acc No", BANK_DETAILS.accountNumber],
              ["Amount", BANK_DETAILS.amount],
              ["Reference", BANK_DETAILS.reference],
            ].map(([label, val]) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-[#9CA3AF] w-20 shrink-0">{label}</span>
                <span className={`text-[#1C1C1E] ${label === "Amount" ? "font-bold" : ""}`}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment history */}
      {profile.payments.length > 0 && (
        <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)]">
          <h2 className="font-extrabold text-[#1C1C1E] mb-4">Payment history</h2>
          <div>
            {profile.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3 border-b border-[#F4F1EA] last:border-0">
                <div>
                  <p className="text-[14px] text-[#1C1C1E] font-semibold">
                    {p.type === "SUBSCRIPTION" ? "Plan subscription" : p.type === "BOOST_AD" ? "Boost Ad" : "Success Fee"}
                  </p>
                  <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                    {new Date(p.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#1C1C1E] text-[14px]">RM {Number(p.amount).toLocaleString()}</p>
                  <span className={`text-[11px] font-bold ${p.status === "PAID" ? "text-[#16A34A]" : p.status === "FAILED" ? "text-[#DC2626]" : "text-[#D97706]"}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link href="/pricing" className="text-sm font-bold text-[#F97316] hover:text-[#EA580C] transition-colors block text-center">
        View full pricing details →
      </Link>
    </div>
  )
}

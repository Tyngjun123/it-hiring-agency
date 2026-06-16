import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { requestUpgradeToPro } from "@/app/actions/boost"

const BANK_DETAILS = {
  bank: "Maybank",
  accountName: "IT Hire Sdn Bhd",
  accountNumber: "1234 5678 9012",
  amount: "RM 500.00",
  reference: "PRO-{your company name}",
}

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
  if (!profile) redirect("/company/setup")

  const activeCount = profile.jobListings.length
  const isPro = profile.plan === "PRO"
  const hasPendingUpgrade = profile.payments.some(
    (p) => p.type === "SUBSCRIPTION" && p.status === "PENDING"
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-extrabold text-[#1C1C1E] tracking-tight">Billing &amp; Plan</h1>
        <p className="text-sm text-[#9CA3AF] mt-0.5">{profile.companyName}</p>
      </div>

      {requested === "1" && (
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-3 text-sm text-[#15803D] font-medium">
          Upgrade request received. We'll activate your Pro plan within 1 business day after payment confirmation.
        </div>
      )}

      {/* Current plan */}
      <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 space-y-4 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)]">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-[#1C1C1E]">Current plan</h2>
          <span className={`text-[12px] px-3 py-1 rounded-full font-bold ${isPro ? "bg-[#FFF7ED] text-[#C2410C]" : "bg-[#F4F1EA] text-[#6B7280]"}`}>
            {profile.plan}
          </span>
        </div>

        <div className="text-sm text-[#6B7280] space-y-1">
          <p>Active listings: <span className="font-semibold text-[#1C1C1E]">{activeCount} / {isPro ? "∞" : "10"}</span></p>
          {isPro && profile.billingStart && (
            <p>Pro since: <span className="font-semibold text-[#1C1C1E]">
              {new Date(profile.billingStart).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
            </span></p>
          )}
        </div>

        {!isPro && (
          <div className="pt-3 border-t border-[#F4F1EA] space-y-3">
            <p className="text-sm text-[#6B7280]">
              Upgrade to <strong className="text-[#1C1C1E]">Pro</strong> for unlimited job listings at <strong className="text-[#1C1C1E]">RM 500 / month</strong>.
            </p>
            {hasPendingUpgrade ? (
              <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl px-4 py-3 text-sm text-[#92400E] font-medium">
                Upgrade request pending — we'll activate within 1 business day.
              </div>
            ) : (
              <form action={requestUpgradeToPro}>
                <Button type="submit"
                  className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-[11px] shadow-[0_4px_10px_rgba(249,115,22,0.3)]">
                  Request Pro Upgrade
                </Button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Bank transfer instructions */}
      {!isPro && (
        <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 space-y-4 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)]">
          <h2 className="font-extrabold text-[#1C1C1E]">How to pay</h2>
          <ol className="text-sm text-[#6B7280] space-y-2 list-decimal list-inside">
            <li>Click <strong className="text-[#1C1C1E]">Request Pro Upgrade</strong> above</li>
            <li>Transfer <strong className="text-[#1C1C1E]">RM 500</strong> to the account below</li>
            <li>Email your payment receipt to <a href="mailto:tyngjun123@gmail.com" className="text-[#F97316] hover:underline">tyngjun123@gmail.com</a></li>
            <li>We'll activate your Pro plan within 1 business day</li>
          </ol>
          <div className="bg-[#FAFAF8] border border-[#EEEBE3] rounded-xl p-4 text-sm space-y-1.5 font-mono">
            <p><span className="text-[#9CA3AF]">Bank: </span><span className="text-[#1C1C1E]">{BANK_DETAILS.bank}</span></p>
            <p><span className="text-[#9CA3AF]">Name: </span><span className="text-[#1C1C1E]">{BANK_DETAILS.accountName}</span></p>
            <p><span className="text-[#9CA3AF]">Acc No: </span><span className="text-[#1C1C1E]">{BANK_DETAILS.accountNumber}</span></p>
            <p><span className="text-[#9CA3AF]">Amount: </span><span className="text-[#1C1C1E] font-bold">{BANK_DETAILS.amount}</span></p>
            <p><span className="text-[#9CA3AF]">Ref: </span><span className="text-[#1C1C1E]">{BANK_DETAILS.reference}</span></p>
          </div>
        </div>
      )}

      {/* Payment history */}
      {profile.payments.length > 0 && (
        <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 space-y-3 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)]">
          <h2 className="font-extrabold text-[#1C1C1E]">Payment history</h2>
          <div className="space-y-1">
            {profile.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm py-2.5 border-b border-[#F4F1EA] last:border-0">
                <div>
                  <p className="text-[#1C1C1E] font-semibold">
                    {p.type === "SUBSCRIPTION" ? "Pro Subscription" : p.type === "BOOST_AD" ? "Boost Ad" : "Success Fee"}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    {new Date(p.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#1C1C1E]">RM {Number(p.amount).toLocaleString()}</p>
                  <span className={`text-xs font-bold ${p.status === "PAID" ? "text-[#16A34A]" : p.status === "FAILED" ? "text-[#DC2626]" : "text-[#D97706]"}`}>
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

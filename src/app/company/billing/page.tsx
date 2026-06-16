import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Navbar from "@/components/navbar"
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Billing & Plan</h1>
          <p className="text-sm text-gray-500 mt-0.5">{profile.companyName}</p>
        </div>

        {requested === "1" && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
            Upgrade request received. We'll activate your Pro plan within 1 business day after payment confirmation.
          </div>
        )}

        {/* Current plan */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Current plan</h2>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isPro ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
              {profile.plan}
            </span>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p>Active listings: <span className="font-medium text-gray-900">{activeCount} / {isPro ? "∞" : "10"}</span></p>
            {isPro && profile.billingStart && (
              <p>Pro since: <span className="font-medium text-gray-900">
                {new Date(profile.billingStart).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
              </span></p>
            )}
          </div>

          {!isPro && (
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <p className="text-sm text-gray-500">
                Upgrade to <strong>Pro</strong> for unlimited job listings at <strong>RM 500 / month</strong>.
              </p>
              {hasPendingUpgrade ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-700">
                  Upgrade request pending — we'll activate within 1 business day.
                </div>
              ) : (
                <form action={requestUpgradeToPro}>
                  <Button type="submit" className="w-full">Request Pro Upgrade</Button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Bank transfer instructions */}
        {!isPro && (
          <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">How to pay</h2>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>Click <strong>Request Pro Upgrade</strong> above</li>
              <li>Transfer <strong>RM 500</strong> to the account below</li>
              <li>Email us your payment receipt at <a href="mailto:tyngjun123@gmail.com" className="text-blue-600 hover:underline">tyngjun123@gmail.com</a></li>
              <li>We'll activate your Pro plan within 1 business day</li>
            </ol>
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1.5 font-mono">
              <p><span className="text-gray-500">Bank:</span> {BANK_DETAILS.bank}</p>
              <p><span className="text-gray-500">Name:</span> {BANK_DETAILS.accountName}</p>
              <p><span className="text-gray-500">Acc No:</span> {BANK_DETAILS.accountNumber}</p>
              <p><span className="text-gray-500">Amount:</span> {BANK_DETAILS.amount}</p>
              <p><span className="text-gray-500">Ref:</span> {BANK_DETAILS.reference}</p>
            </div>
          </div>
        )}

        {/* Payment history */}
        {profile.payments.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-3">
            <h2 className="font-semibold text-gray-900">Payment history</h2>
            <div className="space-y-2">
              {profile.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-gray-900 font-medium">
                      {p.type === "SUBSCRIPTION" ? "Pro Subscription" : p.type === "BOOST_AD" ? "Boost Ad" : "Success Fee"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(p.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">RM {Number(p.amount).toLocaleString()}</p>
                    <span className={`text-xs font-medium ${p.status === "PAID" ? "text-green-600" : p.status === "FAILED" ? "text-red-500" : "text-yellow-600"}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link href="/pricing" className="text-sm text-blue-600 hover:underline block text-center">
          View full pricing details →
        </Link>
      </main>
    </div>
  )
}

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Navbar from "@/components/navbar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { requestBoost } from "@/app/actions/boost"

export default async function BoostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ requested?: string }>
}) {
  const { id } = await params
  const { requested } = await searchParams
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const profile = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) redirect("/company/setup")

  const job = await prisma.jobListing.findUnique({
    where: { id, companyId: profile.id },
    include: {
      boostAds: {
        where: { status: "ACTIVE", expiresAt: { gt: new Date() } },
      },
    },
  })
  if (!job) redirect("/company/jobs")

  const activeBoost = job.boostAds[0] ?? null
  const pendingBoostPayment = await prisma.payment.findFirst({
    where: {
      companyId: profile.id,
      type: "BOOST_AD",
      status: "PENDING",
      billplzRef: { startsWith: `BOOST|${id}|` },
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">

        <div>
          <Link href="/company/jobs" className="text-sm text-gray-400 hover:text-gray-600">← Back to jobs</Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">Boost listing</h1>
          <p className="text-sm text-gray-500 mt-0.5">{job.title}</p>
        </div>

        {requested === "1" && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
            Boost request received. Send payment receipt to <a href="mailto:support@techirex.com" className="underline">support@techirex.com</a> and we'll activate within 1 business day.
          </div>
        )}

        {activeBoost ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-2">
            <p className="font-semibold text-amber-800">This job is currently boosted</p>
            <p className="text-sm text-amber-700">
              Type: {activeBoost.boostType === "PINNED_SEARCH" ? "Search Pin" : "Homepage Banner"}
            </p>
            <p className="text-sm text-amber-700">
              Expires: {new Date(activeBoost.expiresAt).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        ) : pendingBoostPayment ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-sm text-yellow-700">
            Boost payment pending — we'll activate once payment is confirmed.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search Pin */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-gray-900">Search Pin</h2>
                  <p className="text-sm text-gray-500 mt-1">Your listing appears at the top of all search results with a Featured badge for 30 days.</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-gray-900">RM 100</p>
                  <p className="text-xs text-gray-400">/ 30 days</p>
                </div>
              </div>
              <form action={requestBoost.bind(null, id, "PINNED_SEARCH")}>
                <Button type="submit" className="w-full">Request Search Pin</Button>
              </form>
            </div>

            {/* Homepage Banner */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-gray-900">Homepage Banner</h2>
                  <p className="text-sm text-gray-500 mt-1">Spotlight your company in the homepage banner visible to all visitors for 30 days.</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-gray-900">RM 200</p>
                  <p className="text-xs text-gray-400">/ 30 days</p>
                </div>
              </div>
              <form action={requestBoost.bind(null, id, "HOMEPAGE_BANNER")}>
                <Button type="submit" variant="outline" className="w-full">Request Homepage Banner</Button>
              </form>
            </div>

            {/* Payment instructions */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-sm text-gray-600 space-y-2">
              <p className="font-medium text-gray-900">How it works</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click a boost option above</li>
                <li>Transfer the amount to our bank account</li>
                <li>Email receipt to <a href="mailto:support@techirex.com" className="text-blue-600 hover:underline">support@techirex.com</a></li>
                <li>Boost activates within 1 business day</li>
              </ol>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

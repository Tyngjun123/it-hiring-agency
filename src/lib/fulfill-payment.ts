import "server-only"
import { prisma } from "@/lib/prisma"

// Idempotently fulfils a PENDING payment — activates the plan upgrade or creates
// the boost ad, then marks the payment PAID. Safe to call from admin approval
// or the Billplz webhook; a no-op if the payment isn't PENDING.
export async function fulfillPayment(paymentId: string): Promise<boolean> {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
  if (!payment || payment.status !== "PENDING") return false

  if (payment.type === "SUBSCRIPTION") {
    // Ref format: "SUB|<PLAN>|<companyId>"; older refs default to PRO.
    const refPlan = payment.billplzRef?.split("|")[1]
    const targetPlan = refPlan === "MAX" ? "MAX" : "PRO"
    await prisma.companyProfile.update({
      where: { id: payment.companyId },
      data: { plan: targetPlan, billingStart: new Date(), planStatus: "active" },
    })
  }

  if (payment.type === "BOOST_AD" && payment.billplzRef) {
    const [, jobId, boostType] = payment.billplzRef.split("|")
    if (jobId && boostType) {
      const now = new Date()
      const expiresAt = new Date(now)
      expiresAt.setDate(expiresAt.getDate() + 30)
      await prisma.boostAd.create({
        data: {
          jobListingId: jobId,
          companyId: payment.companyId,
          boostType: boostType as "PINNED_SEARCH" | "HOMEPAGE_BANNER",
          pricePaid: payment.amount,
          startsAt: now,
          expiresAt,
          status: "ACTIVE",
          paymentRef: paymentId,
        },
      })
    }
  }

  await prisma.payment.update({ where: { id: paymentId }, data: { status: "PAID" } })
  return true
}

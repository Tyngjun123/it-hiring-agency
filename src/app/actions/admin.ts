"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

const ADMIN_EMAILS = ["tyngjun123@gmail.com"]

async function verifyAdmin() {
  const session = await auth()
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) redirect("/")
  return session
}

export async function approvePayment(paymentId: string) {
  await verifyAdmin()

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { company: true },
  })
  if (!payment || payment.status !== "PENDING") return

  if (payment.type === "SUBSCRIPTION") {
    await prisma.companyProfile.update({
      where: { id: payment.companyId },
      data: { plan: "PRO", billingStart: new Date(), planStatus: "active" },
    })
  }

  if (payment.type === "BOOST_AD" && payment.billplzRef) {
    // Parse "BOOST|jobId|boostType"
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

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "PAID" },
  })

  revalidatePath("/admin")
}

export async function rejectPayment(paymentId: string) {
  await verifyAdmin()
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "FAILED" },
  })
  revalidatePath("/admin")
}

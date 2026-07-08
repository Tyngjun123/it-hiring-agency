"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { isAdminEmail } from "@/lib/admin"
import { fulfillPayment } from "@/lib/fulfill-payment"

async function verifyAdmin() {
  const session = await auth()
  if (!isAdminEmail(session?.user?.email)) redirect("/")
  return session
}

export async function approvePayment(paymentId: string) {
  await verifyAdmin()
  await fulfillPayment(paymentId) // shared with the Billplz webhook
  revalidatePath("/admin")
  redirect("/admin?toast=payment_approved")
}

export async function rejectPayment(paymentId: string) {
  await verifyAdmin()
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "FAILED" },
  })
  revalidatePath("/admin")
  redirect("/admin?toast=payment_rejected")
}

// ── Company plan management ───────────────────────────────────────────────────

export async function setCompanyPlan(formData: FormData) {
  await verifyAdmin()

  const companyId = formData.get("companyId") as string
  const plan = formData.get("plan") as "FREE" | "PRO" | "MAX"
  const forever = formData.get("forever") === "on"
  const expiryRaw = (formData.get("planExpiresAt") as string)?.trim()

  if (!companyId || !["FREE", "PRO", "MAX"].includes(plan)) {
    redirect("/admin/companies?error=1")
  }

  // "Forever" or FREE plan = no expiry. Otherwise use the chosen date (if any).
  let planExpiresAt: Date | null = null
  if (!forever && plan !== "FREE" && expiryRaw) {
    const parsed = new Date(expiryRaw)
    if (!isNaN(parsed.getTime())) planExpiresAt = parsed
  }

  await prisma.companyProfile.update({
    where: { id: companyId },
    data: {
      plan,
      planExpiresAt,
      planStatus: "active",
      billingStart: plan === "FREE" ? null : new Date(),
    },
  })

  revalidatePath("/admin/companies")
  revalidatePath("/admin")
  redirect("/admin/companies?toast=plan_saved")
}

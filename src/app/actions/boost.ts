"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { resend, FROM_EMAIL } from "@/lib/resend"

const ADMIN_EMAIL = "support@stacktalentx.com"

export async function requestBoost(jobId: string, boostType: "PINNED_SEARCH" | "HOMEPAGE_BANNER") {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const profile = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) redirect("/company/setup")

  const job = await prisma.jobListing.findUnique({ where: { id: jobId, companyId: profile.id } })
  if (!job) redirect("/company/jobs")

  const amount = boostType === "HOMEPAGE_BANNER" ? 200 : 100

  await prisma.payment.create({
    data: {
      companyId: profile.id,
      type: "BOOST_AD",
      amount,
      // encode job info in billplzRef until Billplz is integrated
      billplzRef: `BOOST|${jobId}|${boostType}`,
      status: "PENDING",
    },
  })

  resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `Boost request — ${job.title}`,
    html: `
      <p><strong>${profile.companyName}</strong> has requested a boost for <strong>${job.title}</strong>.</p>
      <p>Boost type: ${boostType === "PINNED_SEARCH" ? "Search Pin (RM 100)" : "Homepage Banner (RM 200)"}</p>
      <p>Review pending payments in the <a href="${process.env.AUTH_URL}/admin">Admin Panel</a>.</p>
    `,
  }).catch(console.error)

  redirect(`/company/jobs/${jobId}/boost?requested=1`)
}

async function requestUpgrade(targetPlan: "PRO" | "MAX") {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const profile = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) redirect("/company/setup")
  if (profile.plan === targetPlan) redirect("/company/billing")

  // Gate paid plans behind their public-availability flags (defense in depth — the UI also hides them)
  const config = await prisma.siteConfig.findUnique({ where: { id: "singleton" } })
  if (targetPlan === "MAX" && !config?.maxPlanEnabled) redirect("/company/billing")
  if (targetPlan === "PRO" && !config?.proPlanEnabled) redirect("/company/billing")

  const amount = targetPlan === "MAX" ? 400 : 200

  await prisma.payment.create({
    data: {
      companyId: profile.id,
      type: "SUBSCRIPTION",
      amount,
      billplzRef: `SUB|${targetPlan}|${profile.id}`,
      status: "PENDING",
    },
  })

  resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `${targetPlan} upgrade request — ${profile.companyName}`,
    html: `
      <p><strong>${profile.companyName}</strong> (${profile.contactEmail}) has requested a ${targetPlan} upgrade.</p>
      <p>Amount: RM ${amount} / month</p>
      <p>Review in the <a href="${process.env.AUTH_URL}/admin">Admin Panel</a>.</p>
    `,
  }).catch(console.error)

  redirect("/company/billing?requested=1")
}

export async function requestUpgradeToPro() {
  await requestUpgrade("PRO")
}

export async function requestUpgradeToMax() {
  await requestUpgrade("MAX")
}

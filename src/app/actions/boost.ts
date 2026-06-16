"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { resend, FROM_EMAIL } from "@/lib/resend"

const ADMIN_EMAIL = "tyngjun123@gmail.com"

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

export async function requestUpgradeToPro() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const profile = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) redirect("/company/setup")
  if (profile.plan === "PRO") redirect("/company/billing")

  await prisma.payment.create({
    data: {
      companyId: profile.id,
      type: "SUBSCRIPTION",
      amount: 500,
      billplzRef: `SUB|${profile.id}`,
      status: "PENDING",
    },
  })

  resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `Pro upgrade request — ${profile.companyName}`,
    html: `
      <p><strong>${profile.companyName}</strong> (${profile.contactEmail}) has requested a Pro upgrade.</p>
      <p>Amount: RM 500 / month</p>
      <p>Review in the <a href="${process.env.AUTH_URL}/admin">Admin Panel</a>.</p>
    `,
  }).catch(console.error)

  redirect("/company/billing?requested=1")
}

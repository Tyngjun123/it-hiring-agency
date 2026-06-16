"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { sendApplicationConfirmation, sendNewApplicantAlert } from "@/lib/emails"

export async function applyToJob(jobId: string) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.role !== "INTERVIEWEE") return { error: "Only job seekers can apply." }

  const profile = await prisma.intervieweeProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true, email: true } } },
  })

  let intervieweeId: string

  if (!profile) {
    const newProfile = await prisma.intervieweeProfile.create({
      data: { userId: session.user.id },
    })
    intervieweeId = newProfile.id
  } else {
    const existing = await prisma.application.findUnique({
      where: { jobId_intervieweeId: { jobId, intervieweeId: profile.id } },
    })
    if (existing) return { error: "already_applied" }
    intervieweeId = profile.id
  }

  await prisma.application.create({ data: { jobId, intervieweeId } })

  // Fetch job + company info for emails
  const job = await prisma.jobListing.findUnique({
    where: { id: jobId },
    include: { company: { select: { companyName: true, contactEmail: true } } },
  })

  if (job && session.user.email) {
    const applicantName = profile?.user.name ?? session.user.email
    const companyName = job.hideCompanyInfo ? null : job.company.companyName

    // Fire-and-forget — don't block the response on email delivery
    Promise.all([
      sendApplicationConfirmation({
        to: session.user.email,
        applicantName,
        jobTitle: job.title,
        companyName,
        jobId,
      }),
      sendNewApplicantAlert({
        to: job.company.contactEmail,
        companyName: job.company.companyName,
        jobTitle: job.title,
        applicantName,
        applicantEmail: session.user.email,
        jobId,
      }),
    ]).catch(console.error)
  }

  revalidatePath(`/jobs/${jobId}`)
}

"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { sendApplicationConfirmation, sendNewApplicantAlert } from "@/lib/emails"
import { createNotification } from "@/lib/notifications/notify"

export async function applyToJob(jobId: string, answers?: { question: string; answer: string }[]) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.role !== "INTERVIEWEE") return { error: "Only job seekers can apply." }

  // Validate the job exists and is still open before creating an application.
  const target = await prisma.jobListing.findUnique({ where: { id: jobId }, select: { status: true } })
  if (!target) return { error: "This job is no longer available." }
  if (target.status !== "ACTIVE") return { error: "This job is no longer accepting applications." }

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

  await prisma.application.create({
    data: {
      jobId,
      intervieweeId,
      answers: answers && answers.length > 0 ? answers : undefined,
    },
  })

  // Fetch job + company info for emails
  const job = await prisma.jobListing.findUnique({
    where: { id: jobId },
    include: { company: { select: { userId: true, companyName: true, contactEmail: true } } },
  })

  if (job && session.user.email) {
    const applicantName = profile?.user.name ?? session.user.email
    const companyName = job.hideCompanyInfo ? null : job.company.companyName

    // In-app 🔔 to the company (fail-safe — never blocks the application)
    await createNotification({
      userId: job.company.userId,
      type: "NEW_APPLICANT",
      title: "New applicant",
      body: `${applicantName} applied to ${job.title}`,
      link: `/company/jobs/${jobId}/applicants`,
    })

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

export async function withdrawApplication(applicationId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  // Ownership + state guard: only the applicant can withdraw, and only while the
  // application is still pending (you can't withdraw after a decision).
  const app = await prisma.application.findFirst({
    where: {
      id: applicationId,
      status: "PENDING",
      interviewee: { userId: session.user.id },
    },
    select: { id: true, jobId: true },
  })
  if (!app) return { error: "This application can no longer be withdrawn." }

  await prisma.application.delete({ where: { id: app.id } })

  revalidatePath("/dashboard")
  revalidatePath(`/jobs/${app.jobId}`)
}

// Save / unsave a job (bookmark). Returns the new saved state.
export async function toggleSaveJob(jobId: string): Promise<{ saved: boolean } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Please sign in to save jobs." }
  if (session.user.role !== "INTERVIEWEE") return { error: "Only job seekers can save jobs." }

  // Ensure the seeker has a profile (Google users may save before completing onboarding).
  let profile = await prisma.intervieweeProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!profile) {
    profile = await prisma.intervieweeProfile.create({ data: { userId: session.user.id }, select: { id: true } })
  }

  const existing = await prisma.savedJob.findUnique({
    where: { intervieweeId_jobId: { intervieweeId: profile.id, jobId } },
    select: { id: true },
  })

  let saved: boolean
  if (existing) {
    await prisma.savedJob.delete({ where: { id: existing.id } })
    saved = false
  } else {
    await prisma.savedJob.create({ data: { intervieweeId: profile.id, jobId } })
    saved = true
  }

  revalidatePath("/")
  revalidatePath("/profile")
  revalidatePath(`/jobs/${jobId}`)
  return { saved }
}

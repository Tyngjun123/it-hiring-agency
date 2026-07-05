"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { sendResultNotification } from "@/lib/emails"
import { createNotification } from "@/lib/notifications/notify"

async function getCompanyProfile() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const profile = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  })
  return { userId: session.user.id, profile }
}

export async function setupCompanyProfile(_prev: unknown, formData: FormData) {
  const { userId } = await getCompanyProfile()
  const isSelfEmployed = formData.get("isSelfEmployed") === "on"

  let data

  if (isSelfEmployed) {
    // Self-employed (no SSM): name + WhatsApp drive the listing; no company fields.
    const personalName = (formData.get("personalName") as string)?.trim()
    const whatsappNumber = (formData.get("whatsappNumber") as string)?.trim()
    if (!personalName || !whatsappNumber) {
      return { error: "Full name and WhatsApp number are required." }
    }
    // Contact email: use provided, else fall back to the account email.
    let contactEmail = (formData.get("contactEmail") as string)?.trim()
    if (!contactEmail) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
      contactEmail = user?.email ?? ""
    }

    data = {
      companyName: personalName, // listings show the person's name
      contactEmail,
      description: (formData.get("description") as string) || null,
      website: null,
      ssm: null,
      linkedinUrl: null,
      isSelfEmployed: true,
      whatsappNumber,
    }
  } else {
    const companyName = (formData.get("companyName") as string)?.trim()
    const contactEmail = (formData.get("contactEmail") as string)?.trim()
    if (!companyName || !contactEmail) {
      return { error: "Company name and contact email are required." }
    }
    data = {
      companyName,
      contactEmail,
      description: (formData.get("description") as string) || null,
      website: (formData.get("website") as string) || null,
      ssm: (formData.get("ssm") as string) || null,
      linkedinUrl: (formData.get("linkedinUrl") as string) || null,
      isSelfEmployed: false,
      whatsappNumber: null,
    }
  }

  await prisma.companyProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  })

  redirect("/company/jobs?toast=company_saved")
}

export async function createJobListing(formData: FormData) {
  const { profile } = await getCompanyProfile()
  if (!profile) redirect("/company/setup")

  // Enforce active-listing cap per plan (Free: 10, Pro: 30, Max: unlimited)
  if (profile.plan !== "MAX") {
    const cap = profile.plan === "PRO" ? 30 : 10
    const activeCount = await prisma.jobListing.count({
      where: { companyId: profile.id, status: "ACTIVE" },
    })
    if (activeCount >= cap) {
      redirect(`/company/jobs?toastError=${profile.plan === "PRO" ? "pro_limit" : "free_limit"}`)
    }
  }

  const requiresExp = formData.get("requiresExp") === "on"

  await prisma.jobListing.create({
    data: {
      companyId: profile.id,
      title: formData.get("title") as string,
      location: (formData.get("location") as string)?.trim() || "",
      description: formData.get("description") as string,
      workType: formData.get("workType") as never,
      employmentType: (formData.get("employmentType") as string) || "FULL_TIME",
      payType: (formData.get("payType") as never) ?? "MONTHLY",
      payRangeFrom: Number(formData.get("payRangeFrom")),
      payRangeTo: Number(formData.get("payRangeTo")),
      sellingPoint1: formData.get("sellingPoint1") as string,
      sellingPoint2: formData.get("sellingPoint2") as string,
      sellingPoint3: formData.get("sellingPoint3") as string,
      requiresExp,
      yearsExpFrom: requiresExp ? Number(formData.get("yearsExpFrom")) || null : null,
      yearsExpTo: requiresExp ? Number(formData.get("yearsExpTo")) || null : null,
      benefits: (formData.get("benefits") as string) || null,
      questions: (formData.get("questions") as string) || null,
      hideCompanyInfo: formData.get("hideCompanyInfo") === "on",
      requiredSkills: formData.getAll("requiredSkills") as string[],
      status: "ACTIVE",
    },
  })

  revalidatePath("/company/jobs")
  revalidatePath("/")
  redirect("/company/jobs?toast=job_posted")
}

export async function updateJobListing(id: string, formData: FormData) {
  const { profile } = await getCompanyProfile()
  if (!profile) redirect("/company/setup")

  const requiresExp = formData.get("requiresExp") === "on"

  await prisma.jobListing.update({
    where: { id, companyId: profile.id },
    data: {
      title: formData.get("title") as string,
      location: (formData.get("location") as string)?.trim() || "",
      description: formData.get("description") as string,
      workType: formData.get("workType") as never,
      employmentType: (formData.get("employmentType") as string) || "FULL_TIME",
      payType: formData.get("payType") as never,
      payRangeFrom: Number(formData.get("payRangeFrom")),
      payRangeTo: Number(formData.get("payRangeTo")),
      sellingPoint1: formData.get("sellingPoint1") as string,
      sellingPoint2: formData.get("sellingPoint2") as string,
      sellingPoint3: formData.get("sellingPoint3") as string,
      requiresExp,
      yearsExpFrom: requiresExp ? Number(formData.get("yearsExpFrom")) || null : null,
      yearsExpTo: requiresExp ? Number(formData.get("yearsExpTo")) || null : null,
      benefits: (formData.get("benefits") as string) || null,
      questions: (formData.get("questions") as string) || null,
      hideCompanyInfo: formData.get("hideCompanyInfo") === "on",
      requiredSkills: formData.getAll("requiredSkills") as string[],
    },
  })

  revalidatePath("/company/jobs")
  revalidatePath("/")
  redirect("/company/jobs?toast=job_updated")
}

const JOB_STATUS_TOAST: Record<string, string> = {
  ACTIVE: "job_activated", PAUSED: "job_paused", CLOSED: "job_closed",
}

export async function updateJobStatus(id: string, status: "ACTIVE" | "PAUSED" | "CLOSED") {
  const { profile } = await getCompanyProfile()
  if (!profile) return

  // Enforce the active-listing cap when (re)activating a job (Free: 10, Pro: 30,
  // Max: unlimited) — otherwise a company could exceed the cap by reactivating paused jobs.
  if (status === "ACTIVE" && profile.plan !== "MAX") {
    const cap = profile.plan === "PRO" ? 30 : 10
    const activeCount = await prisma.jobListing.count({
      where: { companyId: profile.id, status: "ACTIVE", id: { not: id } },
    })
    if (activeCount >= cap) {
      redirect(`/company/jobs?toastError=${profile.plan === "PRO" ? "pro_limit" : "free_limit"}`)
    }
  }

  await prisma.jobListing.update({
    where: { id, companyId: profile.id },
    data: { status },
  })

  revalidatePath("/company/jobs")
  revalidatePath("/")
  redirect(`/company/jobs?toast=${JOB_STATUS_TOAST[status]}`)
}

export async function duplicateJob(id: string) {
  const { profile } = await getCompanyProfile()
  if (!profile) return

  const job = await prisma.jobListing.findUnique({ where: { id, companyId: profile.id } })
  if (!job) return

  await prisma.jobListing.create({
    data: {
      companyId: profile.id,
      title: `${job.title} (Copy)`,
      location: job.location,
      description: job.description,
      workType: job.workType,
      payType: job.payType,
      payRangeFrom: job.payRangeFrom,
      payRangeTo: job.payRangeTo,
      sellingPoint1: job.sellingPoint1,
      sellingPoint2: job.sellingPoint2,
      sellingPoint3: job.sellingPoint3,
      requiresExp: job.requiresExp,
      yearsExpFrom: job.yearsExpFrom,
      yearsExpTo: job.yearsExpTo,
      benefits: job.benefits,
      questions: job.questions,
      hideCompanyInfo: job.hideCompanyInfo,
      status: "DRAFT",
    },
  })

  revalidatePath("/company/jobs")
  redirect("/company/jobs?toast=job_duplicated")
}

export async function updateApplicationStatus(
  applicationId: string,
  status: "PENDING" | "SHORTLISTED" | "INTERVIEWING" | "SUCCESS" | "FAIL"
) {
  const { profile } = await getCompanyProfile()
  if (!profile) return

  // Authorization: only allow updating applications that belong to a job
  // owned by the calling company. Prevents cross-company status tampering (IDOR).
  const owned = await prisma.application.findFirst({
    where: { id: applicationId, jobListing: { companyId: profile.id } },
    select: { id: true },
  })
  if (!owned) return

  const isDecision = status === "SUCCESS" || status === "FAIL"

  const application = await prisma.application.update({
    where: { id: applicationId },
    data: { status, resultMarkedAt: isDecision ? new Date() : null },
    include: {
      jobListing: { select: { title: true } },
      interviewee: { include: { user: { select: { name: true, email: true } } } },
    },
  })

  // In-app 🔔 to the applicant on every status change (fail-safe)
  const STATUS_LABEL: Record<string, string> = {
    PENDING: "Under Review", SHORTLISTED: "Shortlisted", INTERVIEWING: "Interviewing",
    SUCCESS: "Hired", FAIL: "Not Selected",
  }
  await createNotification({
    userId: application.interviewee.userId,
    type: "APPLICATION_STATUS",
    title: "Application update",
    body: `Your application for ${application.jobListing.title} is now ${STATUS_LABEL[status] ?? status}`,
    link: "/dashboard",
  })

  // Email the applicant only on a final decision (Hired / Not Selected) — the
  // intermediate stages (Shortlisted / Interviewing) just update the dashboard.
  if (isDecision) {
    sendResultNotification({
      to: application.interviewee.user.email,
      applicantName: application.interviewee.user.name ?? application.interviewee.user.email,
      jobTitle: application.jobListing.title,
      companyName: profile.companyName,
      status,
    }).catch(console.error)
  }

  revalidatePath(`/company/jobs/${application.jobId}/applicants`)
  revalidatePath("/company/jobs")
  revalidatePath("/dashboard")
}

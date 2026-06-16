"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { sendResultNotification } from "@/lib/emails"

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

  const companyName = (formData.get("companyName") as string)?.trim()
  const contactEmail = (formData.get("contactEmail") as string)?.trim()
  if (!companyName || !contactEmail) {
    return { error: "Company name and contact email are required." }
  }

  const isSelfEmployed = formData.get("isSelfEmployed") === "on"

  const data = {
    companyName,
    contactEmail,
    description: (formData.get("description") as string) || null,
    website: (formData.get("website") as string) || null,
    ssm: (formData.get("ssm") as string) || null,
    linkedinUrl: (formData.get("linkedinUrl") as string) || null,
    isSelfEmployed,
    whatsappNumber: isSelfEmployed ? (formData.get("whatsappNumber") as string) || null : null,
  }

  await prisma.companyProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  })

  redirect("/company/jobs")
}

export async function createJobListing(formData: FormData) {
  const { profile } = await getCompanyProfile()
  if (!profile) redirect("/company/setup")

  // Enforce 10-listing free tier cap
  if (profile.plan === "FREE") {
    const activeCount = await prisma.jobListing.count({
      where: { companyId: profile.id, status: "ACTIVE" },
    })
    if (activeCount >= 10) {
      redirect("/company/jobs?error=limit")
    }
  }

  const requiresExp = formData.get("requiresExp") === "on"

  await prisma.jobListing.create({
    data: {
      companyId: profile.id,
      title: formData.get("title") as string,
      location: formData.get("location") as string,
      description: formData.get("description") as string,
      workType: formData.get("workType") as never,
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
      status: "ACTIVE",
    },
  })

  revalidatePath("/company/jobs")
  revalidatePath("/")
  redirect("/company/jobs")
}

export async function updateJobListing(id: string, formData: FormData) {
  const { profile } = await getCompanyProfile()
  if (!profile) redirect("/company/setup")

  const requiresExp = formData.get("requiresExp") === "on"

  await prisma.jobListing.update({
    where: { id, companyId: profile.id },
    data: {
      title: formData.get("title") as string,
      location: formData.get("location") as string,
      description: formData.get("description") as string,
      workType: formData.get("workType") as never,
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
    },
  })

  revalidatePath("/company/jobs")
  revalidatePath("/")
  redirect("/company/jobs")
}

export async function updateJobStatus(id: string, status: "ACTIVE" | "PAUSED" | "CLOSED") {
  const { profile } = await getCompanyProfile()
  if (!profile) return

  await prisma.jobListing.update({
    where: { id, companyId: profile.id },
    data: { status },
  })

  revalidatePath("/company/jobs")
  revalidatePath("/")
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
}

export async function updateApplicationStatus(
  applicationId: string,
  status: "SUCCESS" | "FAIL"
) {
  const { profile } = await getCompanyProfile()
  if (!profile) return

  const application = await prisma.application.update({
    where: { id: applicationId },
    data: { status, resultMarkedAt: new Date() },
    include: {
      jobListing: { select: { title: true } },
      interviewee: { include: { user: { select: { name: true, email: true } } } },
    },
  })

  // Fire-and-forget email to applicant
  sendResultNotification({
    to: application.interviewee.user.email,
    applicantName: application.interviewee.user.name ?? application.interviewee.user.email,
    jobTitle: application.jobListing.title,
    companyName: profile.companyName,
    status,
  }).catch(console.error)

  revalidatePath("/company/jobs")
}

"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function submitReview(companyId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.role !== "INTERVIEWEE") return { error: "Only job seekers can leave reviews." }

  const profile = await prisma.intervieweeProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return { error: "Profile not found." }

  // Must have a SUCCESS application at this company
  const hiredApp = await prisma.application.findFirst({
    where: {
      intervieweeId: profile.id,
      status: "SUCCESS",
      jobListing: { companyId },
    },
  })
  if (!hiredApp) return { error: "You can only review companies where you were hired." }

  // Check for existing review
  const existing = await prisma.companyReview.findFirst({
    where: { companyId, reviewerId: profile.id },
  })
  if (existing) return { error: "You have already reviewed this company." }

  const rating = Number(formData.get("rating"))
  const title = (formData.get("title") as string)?.trim()
  const body = (formData.get("body") as string)?.trim()

  if (!rating || rating < 1 || rating > 5 || !title || !body) {
    return { error: "Please fill in all fields." }
  }

  await prisma.companyReview.create({
    data: { companyId, reviewerId: profile.id, rating, title, body },
  })

  revalidatePath(`/companies/${companyId}`)
  redirect(`/companies/${companyId}?reviewed=1`)
}

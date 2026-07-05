"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function submitReview(companyId: string, formData: FormData): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.role !== "INTERVIEWEE") return { error: "not-eligible" }

  const rating = Number(formData.get("rating"))
  const title = (formData.get("title") as string)?.trim()
  const body = (formData.get("body") as string)?.trim()
  const department = (formData.get("department") as string)?.trim() || null

  if (!rating || rating < 1 || rating > 5 || !title || !body) {
    return { error: "invalid" }
  }

  // Ensure the interviewee profile exists (upsert for users who skipped onboarding)
  const profile = await prisma.intervieweeProfile.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  })

  const existing = await prisma.companyReview.findFirst({
    where: { companyId, reviewerId: profile.id },
  })
  if (existing) return { error: "already-reviewed" }

  await prisma.companyReview.create({
    data: { companyId, reviewerId: profile.id, rating, title, body, department },
  })

  revalidatePath(`/companies/${companyId}`)
  return {}
}

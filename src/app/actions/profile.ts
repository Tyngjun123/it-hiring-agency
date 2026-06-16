"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

async function getSession() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  return session
}

export async function updateIntervieweeProfile(formData: FormData) {
  const session = await getSession()

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: formData.get("name") as string },
  })

  const socialData = {
    phone: (formData.get("phone") as string) || null,
    whatsappNumber: (formData.get("whatsappNumber") as string) || null,
    linkedinUrl: (formData.get("linkedinUrl") as string) || null,
    facebookUrl: (formData.get("facebookUrl") as string) || null,
    instagramUrl: (formData.get("instagramUrl") as string) || null,
    rednoteUrl: (formData.get("rednoteUrl") as string) || null,
  }

  await prisma.intervieweeProfile.upsert({
    where: { userId: session.user.id },
    update: socialData,
    create: { userId: session.user.id, ...socialData },
  })

  redirect("/profile?saved=1")
}

export async function addSkill(formData: FormData) {
  const session = await getSession()
  const language = (formData.get("language") as string)?.trim()
  const yearsExp = Number(formData.get("yearsExp"))
  if (!language || !yearsExp) return

  const profile = await prisma.intervieweeProfile.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  })

  await prisma.techSkill.create({ data: { profileId: profile.id, language, yearsExp } })
  revalidatePath("/profile")
}

export async function removeSkill(skillId: string) {
  const session = await getSession()
  const skill = await prisma.techSkill.findUnique({
    where: { id: skillId },
    include: { profile: { select: { userId: true } } },
  })
  if (skill?.profile.userId !== session.user.id) return
  await prisma.techSkill.delete({ where: { id: skillId } })
  revalidatePath("/profile")
}

export async function replaceSkills(skills: { language: string; yearsExp: number }[]) {
  const session = await getSession()

  const profile = await prisma.intervieweeProfile.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  })

  await prisma.techSkill.deleteMany({ where: { profileId: profile.id } })
  if (skills.length > 0) {
    await prisma.techSkill.createMany({
      data: skills.map((s) => ({ profileId: profile.id, language: s.language, yearsExp: s.yearsExp })),
    })
  }

  revalidatePath("/profile")
  revalidatePath("/dashboard")
}

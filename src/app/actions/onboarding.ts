"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@/generated/prisma/enums"

export async function setUserRole(role: "INTERVIEWEE" | "COMPANY") {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: role as Role },
  })
}

export async function saveResumeUrl(url: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  let profile = await prisma.intervieweeProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile) {
    profile = await prisma.intervieweeProfile.create({
      data: { userId: session.user.id },
    })
  }

  await prisma.intervieweeProfile.update({
    where: { id: profile.id },
    data: { resumeUrl: url },
  })
}

export async function saveSkills(skills: { language: string; yearsExp: number }[]) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  let profile = await prisma.intervieweeProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile) {
    profile = await prisma.intervieweeProfile.create({
      data: { userId: session.user.id },
    })
  }

  await prisma.techSkill.deleteMany({ where: { profileId: profile.id } })
  await prisma.techSkill.createMany({
    data: skills.map((s) => ({ profileId: profile.id, language: s.language, yearsExp: s.yearsExp })),
  })
}

export async function saveJobPreferences(jobTypes: string[]) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { intervieweeProfile: true },
  })

  let profileId = user?.intervieweeProfile?.id

  if (!profileId) {
    const profile = await prisma.intervieweeProfile.create({
      data: { userId: session.user.id },
    })
    profileId = profile.id
  }

  await prisma.jobPreference.deleteMany({ where: { profileId } })
  await prisma.jobPreference.createMany({
    data: jobTypes.slice(0, 3).map((jobType, order) => ({
      profileId: profileId!,
      jobType: jobType as never,
      order,
    })),
  })
}

"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { ensureResumeTokens } from "@/lib/resume-tokens"
import { supabaseAdmin, RESUME_BUCKET } from "@/lib/supabase-admin"

// Loads the caller's company profile, or redirects. Resume Pool is PRO/MAX only.
async function requirePoolCompany() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const profile = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      plan: true,
      billingStart: true,
      createdAt: true,
      resumeTokens: true,
      resumeTokensRefreshedAt: true,
    },
  })
  if (!profile) redirect("/company/setup")
  return profile
}

// True if this seeker has applied to any of the company's jobs — those résumés
// are already accessible to the company, so unlocking them is free.
async function hasAppliedToCompany(intervieweeId: string, companyId: string): Promise<boolean> {
  const app = await prisma.application.findFirst({
    where: { intervieweeId, jobListing: { companyId } },
    select: { id: true },
  })
  return !!app
}

export type UnlockResult =
  | { ok: true; alreadyUnlocked?: boolean; free?: boolean; remaining: number }
  | { ok: false; error: "upgrade" | "no_tokens" | "not_found" }

export async function unlockResume(intervieweeId: string): Promise<UnlockResult> {
  const profile = await requirePoolCompany()

  if (profile.plan !== "PRO" && profile.plan !== "MAX") {
    return { ok: false, error: "upgrade" }
  }

  const seeker = await prisma.intervieweeProfile.findUnique({
    where: { id: intervieweeId },
    select: { id: true, resumeUrl: true },
  })
  if (!seeker || !seeker.resumeUrl) return { ok: false, error: "not_found" }

  // Already unlocked → idempotent, never re-charge.
  const existing = await prisma.unlockedResume.findUnique({
    where: { companyProfileId_intervieweeId: { companyProfileId: profile.id, intervieweeId } },
    select: { id: true },
  })
  const { tokens } = await ensureResumeTokens(profile)
  if (existing) return { ok: true, alreadyUnlocked: true, remaining: tokens }

  // Applicants to this company are free.
  const free = await hasAppliedToCompany(intervieweeId, profile.id)
  const cost = free ? 0 : 1

  if (cost > 0 && tokens < 1) return { ok: false, error: "no_tokens" }

  // Atomic: create the unlock record, and spend a token only when not free.
  // The conditional decrement (resumeTokens >= cost) guards against races.
  await prisma.$transaction(async (tx) => {
    await tx.unlockedResume.create({
      data: { companyProfileId: profile.id, intervieweeId, costTokens: cost },
    })
    if (cost > 0) {
      await tx.companyProfile.update({
        where: { id: profile.id },
        data: { resumeTokens: { decrement: cost } },
      })
    }
  })

  revalidatePath("/company/resume-pool")
  return { ok: true, free, remaining: Math.max(0, tokens - cost) }
}

// Signs a short-lived résumé URL, but ONLY if this company has unlocked the
// seeker (or the seeker applied to them). Kept separate from the generic
// getResumeViewUrl so the pool never widens résumé access elsewhere.
export async function getPoolResumeViewUrl(
  intervieweeId: string
): Promise<{ url: string } | { error: string }> {
  const profile = await requirePoolCompany()

  const unlocked = await prisma.unlockedResume.findUnique({
    where: { companyProfileId_intervieweeId: { companyProfileId: profile.id, intervieweeId } },
    select: { id: true },
  })
  const allowed = unlocked ? true : await hasAppliedToCompany(intervieweeId, profile.id)
  if (!allowed) return { error: "Résumé is locked. Unlock it first." }

  const seeker = await prisma.intervieweeProfile.findUnique({
    where: { id: intervieweeId },
    select: { resumeUrl: true },
  })
  if (!seeker?.resumeUrl) return { error: "No résumé" }

  // Resolve stored reference (private path or legacy public URL) to a signed URL.
  let path = seeker.resumeUrl
  if (path.startsWith("http")) {
    const marker = "/public/resumes/"
    const idx = path.indexOf(marker)
    if (idx === -1) return { url: path }
    path = decodeURIComponent(path.slice(idx + marker.length))
  }

  const { data, error } = await supabaseAdmin.storage
    .from(RESUME_BUCKET)
    .createSignedUrl(path, 300)

  if (error || !data) return { error: "Could not load résumé." }
  return { url: data.signedUrl }
}

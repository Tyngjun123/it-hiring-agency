import "server-only"
import { prisma } from "@/lib/prisma"
import type { CompanyPlan } from "@/generated/prisma/enums"

// Monthly résumé-unlock allotment per plan. Resume Pool is PRO/MAX only.
export const RESUME_TOKEN_ALLOTMENT: Record<CompanyPlan, number> = {
  FREE: 0,
  PRO: 50,
  MAX: 300,
}

export function resumeTokenAllotment(plan: CompanyPlan): number {
  return RESUME_TOKEN_ALLOTMENT[plan] ?? 0
}

// Latest monthly anniversary of `anchor` that is <= now (aligns refills to the
// company's billing day). Falls back gracefully if anchor is in the future.
export function currentCycleStart(anchor: Date, now: Date = new Date()): Date {
  let cycle = new Date(anchor)
  while (true) {
    const next = new Date(cycle)
    next.setMonth(next.getMonth() + 1)
    if (next > now) break
    cycle = next
  }
  return cycle
}

type TokenProfile = {
  id: string
  plan: CompanyPlan
  billingStart: Date | null
  createdAt: Date
  resumeTokens: number
  resumeTokensRefreshedAt: Date | null
}

// Lazily refill tokens to the plan's allotment at the start of each monthly
// billing cycle. Persists the refill when one is due, then returns the balance.
export async function ensureResumeTokens(
  profile: TokenProfile
): Promise<{ tokens: number; allotment: number }> {
  const allotment = resumeTokenAllotment(profile.plan)
  if (allotment === 0) return { tokens: 0, allotment: 0 }

  const now = new Date()
  const cycleStart = currentCycleStart(profile.billingStart ?? profile.createdAt, now)
  const needsRefill =
    !profile.resumeTokensRefreshedAt || profile.resumeTokensRefreshedAt < cycleStart

  if (needsRefill) {
    await prisma.companyProfile.update({
      where: { id: profile.id },
      data: { resumeTokens: allotment, resumeTokensRefreshedAt: cycleStart },
    })
    return { tokens: allotment, allotment }
  }

  return { tokens: profile.resumeTokens, allotment }
}

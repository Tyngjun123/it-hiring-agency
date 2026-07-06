export const dynamic = "force-dynamic"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ensureResumeTokens } from "@/lib/resume-tokens"
import ResumePoolActions from "@/components/resume-pool-actions"

function maskName(name: string | null): string {
  if (!name?.trim()) return "Job Seeker"
  return name
    .trim()
    .split(/\s+/)
    .map((p) => (p[0] ? p[0].toUpperCase() + "•••" : ""))
    .join(" ")
}

export default async function ResumePoolPage() {
  const session = await auth()
  const profile = await prisma.companyProfile.findUnique({
    where: { userId: session!.user!.id },
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

  const isProOrMax = profile.plan === "PRO" || profile.plan === "MAX"

  // ── Upsell for FREE plans — access is Pro/Max only ──────────────────────────
  if (!isProOrMax) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-[#EEEBE3] rounded-2xl p-8 text-center shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)]">
          <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center text-xl font-bold mx-auto">
            🔒
          </div>
          <h1 className="text-xl font-extrabold text-[#1C1C1E] mt-4">Resume Pool is a Pro / Max feature</h1>
          <p className="text-sm text-[#6B7280] mt-2 max-w-md mx-auto">
            Browse and unlock job seekers&apos; résumés directly. Pro includes 50 unlock tokens
            per month, Max includes 300. Upgrade to get access.
          </p>
          <Link
            href="/company/billing"
            className="inline-flex items-center gap-2 mt-6 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-[11px] px-6 h-11 shadow-[0_4px_10px_rgba(249,115,22,0.3)] transition-colors"
          >
            View plans
          </Link>
        </div>
      </div>
    )
  }

  const { tokens, allotment } = await ensureResumeTokens(profile)

  const [seekers, unlocked, applied] = await Promise.all([
    prisma.intervieweeProfile.findMany({
      // Only seekers who explicitly consented to the talent pool are listed.
      where: { resumeUrl: { not: null }, talentPoolOptIn: true },
      select: {
        id: true,
        user: { select: { name: true } },
        techSkills: { select: { language: true, yearsExp: true }, orderBy: { yearsExp: "desc" } },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
    prisma.unlockedResume.findMany({
      where: { companyProfileId: profile.id },
      select: { intervieweeId: true },
    }),
    prisma.application.findMany({
      where: { jobListing: { companyId: profile.id } },
      select: { intervieweeId: true },
      distinct: ["intervieweeId"],
    }),
  ])

  const unlockedSet = new Set(unlocked.map((u) => u.intervieweeId))
  const appliedSet = new Set(applied.map((a) => a.intervieweeId))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header + token balance */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#1C1C1E] tracking-tight">Resume Pool</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Browse job seekers and unlock their résumés. Applicants who applied to your jobs are free.
          </p>
        </div>
        <div className="bg-[#FFF7ED] border border-[#FBDDBE] rounded-xl px-4 py-3 text-center shrink-0">
          <p className="text-[11px] font-bold text-[#C2410C] uppercase tracking-wide">Tokens this month</p>
          <p className="text-2xl font-extrabold text-[#1C1C1E] leading-tight mt-0.5">
            {tokens}
            <span className="text-sm font-bold text-[#9CA3AF]"> / {allotment}</span>
          </p>
        </div>
      </div>

      {seekers.length === 0 ? (
        <div className="bg-white border border-[#EEEBE3] rounded-2xl p-10 text-center text-sm text-[#9CA3AF]">
          No job seeker résumés available yet.
        </div>
      ) : (
        <div className="space-y-3">
          {seekers.map((s) => {
            const isApplied = appliedSet.has(s.id)
            const revealed = unlockedSet.has(s.id) || isApplied
            return (
              <div
                key={s.id}
                className="bg-white border border-[#EEEBE3] rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-[0_1px_2px_rgba(28,28,30,.03)]"
              >
                <div className="w-11 h-11 rounded-full bg-[#F4F2EC] text-[#9CA3AF] flex items-center justify-center font-bold shrink-0">
                  {revealed ? (s.user?.name?.[0]?.toUpperCase() ?? "?") : "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#1C1C1E] truncate">
                      {revealed ? (s.user?.name ?? "Job Seeker") : maskName(s.user?.name ?? null)}
                    </p>
                    {isApplied && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#16A34A] shrink-0">
                        APPLIED
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {s.techSkills.length === 0 ? (
                      <span className="text-xs text-[#9CA3AF]">No skills listed</span>
                    ) : (
                      s.techSkills.slice(0, 6).map((sk, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F4F2EC] text-[#6B7280]"
                        >
                          {sk.language} · {sk.yearsExp}y
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <ResumePoolActions intervieweeId={s.id} unlocked={revealed} free={isApplied} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { prisma } from "@/lib/prisma"
import { sendJobMatchDigest } from "@/lib/emails"
import { getSiteUrl } from "@/lib/site-url"
import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"

export const maxDuration = 60

// Weekly "jobs matching you" digest to job seekers.
// Opt-out model: every seeker with skills + matches gets it, UNLESS they've
// unsubscribed (jobAlertsOptOut). Matching = overlap between the job's required
// skills and the seeker's tech skills; top 5 by overlap.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const jobs = await prisma.jobListing.findMany({
    where: { status: "ACTIVE", createdAt: { gte: sevenDaysAgo } },
    include: { company: { select: { companyName: true } } },
  })

  if (jobs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, reason: "no new jobs this week" })
  }

  const jobsWithSkills = jobs.map((j) => ({
    job: j,
    skills: new Set(j.requiredSkills.map((s) => s.toLowerCase())),
  }))

  const profiles = await prisma.intervieweeProfile.findMany({
    where: { jobAlertsOptOut: false, techSkills: { some: {} } },
    include: {
      user: { select: { name: true, email: true } },
      techSkills: { select: { language: true } },
    },
  })

  const siteUrl = getSiteUrl()
  let sent = 0

  for (const p of profiles) {
    if (!p.user.email) continue

    const mySkills = new Set(p.techSkills.map((s) => s.language.toLowerCase()))
    const matched = jobsWithSkills
      .map(({ job, skills }) => ({ job, overlap: [...skills].filter((s) => mySkills.has(s)).length }))
      .filter((m) => m.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, 5)

    if (matched.length === 0) continue

    // Ensure a stable unsubscribe token
    let token = p.unsubscribeToken
    if (!token) {
      token = randomUUID()
      await prisma.intervieweeProfile.update({ where: { id: p.id }, data: { unsubscribeToken: token } })
    }

    await sendJobMatchDigest({
      to: p.user.email,
      name: p.user.name,
      unsubscribeUrl: `${siteUrl}/unsubscribe?token=${token}`,
      jobs: matched.map((m) => ({
        id: m.job.id,
        title: m.job.title,
        company: m.job.hideCompanyInfo ? null : m.job.company.companyName,
        location: m.job.location,
        payFrom: m.job.payRangeFrom,
        payTo: m.job.payRangeTo,
      })),
    }).catch((e) => console.error("[job-digest] send failed", e))

    sent++
  }

  return NextResponse.json({ ok: true, sent, jobsConsidered: jobs.length })
}

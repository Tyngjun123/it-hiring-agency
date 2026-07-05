import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { sendCandidateMatchDigest } from "@/lib/emails"

// Daily digest: alert companies about newly-registered job seekers whose skills
// match their active jobs' required skills.
const LOOKBACK_HOURS = 24

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const since = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000)

  // New job seekers (last 24h) who have at least one tech skill
  const newSeekers = await prisma.intervieweeProfile.findMany({
    where: { user: { role: "INTERVIEWEE", createdAt: { gt: since } } },
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
      techSkills: true,
    },
  })

  if (newSeekers.length === 0) {
    return NextResponse.json({ companies: 0, seekers: 0, note: "no new seekers" })
  }

  // Active jobs that declared required skills
  const jobs = await prisma.jobListing.findMany({
    where: { status: "ACTIVE", requiredSkills: { isEmpty: false } },
    select: {
      id: true, title: true, companyId: true, requiredSkills: true,
      company: { select: { companyName: true, contactEmail: true } },
    },
  })

  type Match = { seekerName: string; matched: string[]; jobTitles: Set<string> }
  const byCompany = new Map<string, {
    companyName: string; contactEmail: string; matches: Map<string, Match>
  }>()

  for (const job of jobs) {
    const required = new Set(job.requiredSkills.map((s) => s.toLowerCase()))
    const threshold = Math.min(2, required.size)

    for (const seeker of newSeekers) {
      const seekerSkills = seeker.techSkills.map((t) => t.language)
      const matched = seekerSkills.filter((s) => required.has(s.toLowerCase()))
      if (matched.length < threshold) continue

      let bucket = byCompany.get(job.companyId)
      if (!bucket) {
        bucket = { companyName: job.company.companyName, contactEmail: job.company.contactEmail, matches: new Map() }
        byCompany.set(job.companyId, bucket)
      }
      const seekerName = seeker.user.name ?? seeker.user.email
      const existing = bucket.matches.get(seeker.id)
      if (existing) {
        existing.jobTitles.add(job.title)
        matched.forEach((m) => { if (!existing.matched.includes(m)) existing.matched.push(m) })
      } else {
        bucket.matches.set(seeker.id, { seekerName, matched, jobTitles: new Set([job.title]) })
      }
    }
  }

  let companiesNotified = 0
  for (const bucket of byCompany.values()) {
    if (bucket.matches.size === 0 || !bucket.contactEmail) continue
    const items = Array.from(bucket.matches.values())
    const matchListHtml =
      "<ul>" +
      items.map((m) =>
        `<li><strong>${m.seekerName}</strong> — skills: ${m.matched.join(", ")} (matches: ${Array.from(m.jobTitles).join(", ")})</li>`
      ).join("") +
      "</ul>"

    try {
      await sendCandidateMatchDigest({
        to: bucket.contactEmail,
        companyName: bucket.companyName,
        count: items.length,
        matchListHtml,
      })
      companiesNotified++
    } catch {
      // continue on send failure
    }
  }

  return NextResponse.json({
    companies: companiesNotified,
    seekers: newSeekers.length,
    runAt: new Date().toISOString(),
  })
}

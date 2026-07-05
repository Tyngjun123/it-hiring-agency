import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import ResumeViewer from "@/components/resume-viewer"
import QuickResumeCard from "@/components/quick-resume-card"
import ApplicantStatusSelect from "@/components/applicant-status-select"
import ApplicantControls from "@/components/applicant-controls"

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  SHORTLISTED: "bg-[#EFF6FF] text-[#1D4ED8]",
  INTERVIEWING: "bg-[#FFF7ED] text-[#C2410C]",
  SUCCESS: "bg-green-100 text-green-700",
  FAIL: "bg-red-100 text-red-600",
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Under Review",
  SHORTLISTED: "Shortlisted",
  INTERVIEWING: "Interviewing",
  SUCCESS: "Hired",
  FAIL: "Not Selected",
}

export default async function ApplicantsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ status?: string; sort?: string }>
}) {
  const { id } = await params
  const { status: statusFilter = "all", sort = "recent" } = await searchParams
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const profile = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) redirect("/company/setup")

  const job = await prisma.jobListing.findUnique({
    where: { id, companyId: profile.id },
    include: {
      applications: {
        orderBy: { appliedAt: "desc" },
        include: {
          interviewee: {
            include: {
              user: { select: { name: true, email: true } },
              jobPreferences: true,
              techSkills: true,
            },
          },
        },
      },
    },
  })

  if (!job) redirect("/company/jobs")

  // Compute skill-match % per applicant, then filter + sort in memory.
  const enriched = job.applications.map((app) => {
    const appSkillSet = new Set(app.interviewee.techSkills.map((s) => s.language.toLowerCase()))
    const matchedCount = job.requiredSkills.filter((r) => appSkillSet.has(r.toLowerCase())).length
    const matchPct = job.requiredSkills.length > 0
      ? Math.round((matchedCount / job.requiredSkills.length) * 100)
      : null
    return { app, matchedCount, matchPct }
  })

  const filtered = statusFilter === "all"
    ? enriched
    : enriched.filter((e) => e.app.status === statusFilter)

  const visible = sort === "match"
    ? [...filtered].sort((a, b) => (b.matchPct ?? -1) - (a.matchPct ?? -1))
    : filtered // already newest-first from the query

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/company/jobs" className="text-sm text-gray-400 hover:text-gray-600">← Back</Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Applicants</h1>
            <p className="text-sm text-gray-500 mt-0.5">{job.title} · {job.applications.length} total</p>
          </div>
        </div>
        {job.applications.length > 0 && <ApplicantControls status={statusFilter} sort={sort} />}
      </div>

      {job.applications.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No applications yet</div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No applicants match this filter.</div>
      ) : (
        <div className="space-y-3">
          {visible.map(({ app, matchedCount, matchPct }) => {
            const matchColor = matchPct === null ? ""
              : matchPct >= 66 ? "bg-green-100 text-green-700"
              : matchPct >= 33 ? "bg-amber-100 text-amber-700"
              : "bg-gray-100 text-gray-500"

            return (
            <div key={app.id} className="bg-white border border-gray-100 rounded-xl p-5">
              {/* Header row: name/email/skills on the left, actions on the right */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900">
                      {app.interviewee.user.name ?? app.interviewee.user.email}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[app.status]}`}>
                      {STATUS_LABELS[app.status] ?? app.status}
                    </span>
                    {matchPct !== null && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${matchColor}`}
                        title={`${matchedCount} of ${job.requiredSkills.length} required skills`}>
                        {matchPct}% match
                      </span>
                    )}
                  </div>

                  {/* Contact — highlighted so the company can reach out immediately */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm">
                    <a href={`mailto:${app.interviewee.user.email}`} className="text-[#1D4ED8] hover:underline font-medium">
                      {app.interviewee.user.email}
                    </a>
                    {app.interviewee.phone && (
                      <a href={`tel:${app.interviewee.phone}`} className="text-[#1D4ED8] hover:underline font-medium">
                        📞 {app.interviewee.phone}
                      </a>
                    )}
                  </div>

                  {app.interviewee.techSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {app.interviewee.techSkills.map((s) => {
                        const isMatch = job.requiredSkills.some((r) => r.toLowerCase() === s.language.toLowerCase())
                        return (
                          <span key={s.id} className={`text-xs px-2 py-0.5 rounded-full ${isMatch ? "bg-green-50 text-green-700 font-semibold border border-green-200" : "bg-gray-100 text-gray-600"}`}>
                            {s.language} · {s.yearsExp}yr
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  <ApplicantStatusSelect applicationId={app.id} current={app.status} />
                </div>
              </div>

              {/* Employer questions & answers */}
              {Array.isArray(app.answers) && app.answers.length > 0 && (
                <div className="mt-3 border border-[#EEEBE3] rounded-xl p-4 bg-[#FBFAF6] space-y-2.5">
                  <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Application answers</p>
                  {(app.answers as { question: string; answer: string }[]).map((qa, i) => (
                    <div key={i}>
                      <p className="text-[12.5px] font-semibold text-[#3A3A3C]">{qa.question}</p>
                      <p className="text-[13px] text-[#6B7280] mt-0.5 whitespace-pre-wrap">{qa.answer}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Full-width resume / quick resume below the header */}
              {app.interviewee.resumeUrl ? (
                <ResumeViewer stored={app.interviewee.resumeUrl} />
              ) : (
                <QuickResumeCard
                  data={{
                    name: app.interviewee.user.name ?? app.interviewee.user.email,
                    email: app.interviewee.user.email,
                    phone: app.interviewee.phone,
                    linkedinUrl: app.interviewee.linkedinUrl,
                    jobPreferences: app.interviewee.jobPreferences.map((p) => ({ jobType: p.jobType })),
                    techSkills: app.interviewee.techSkills.map((s) => ({ language: s.language, yearsExp: s.yearsExp })),
                  }}
                />
              )}

              <p className="text-xs text-gray-400 mt-2">
                Applied {new Date(app.appliedAt).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

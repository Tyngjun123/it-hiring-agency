import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/navbar"
import Link from "next/link"

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  SUCCESS: "bg-green-50 text-green-700 border border-green-200",
  FAIL: "bg-red-50 text-red-600 border border-red-200",
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Under Review",
  SUCCESS: "Hired",
  FAIL: "Not Selected",
}

const WORK_TYPE_LABEL: Record<string, string> = {
  ONSITE: "On-site", REMOTE: "Remote", HYBRID: "Hybrid",
}

export default async function DashboardPage() {
  const session = await auth()

  const profile = await prisma.intervieweeProfile.findUnique({
    where: { userId: session!.user!.id! },
    include: {
      techSkills: true,
      jobPreferences: { orderBy: { order: "asc" } },
      applications: {
        orderBy: { appliedAt: "desc" },
        include: {
          jobListing: {
            include: { company: { select: { id: true, companyName: true } } },
          },
        },
      },
    },
  })

  const pending = profile?.applications.filter((a) => a.status === "PENDING").length ?? 0
  const hired = profile?.applications.filter((a) => a.status === "SUCCESS").length ?? 0
  const total = profile?.applications.length ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{session!.user!.name ?? session!.user!.email}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Applied", value: total },
            { label: "Under Review", value: pending },
            { label: "Hired", value: hired },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Profile summary */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">My Profile</h2>
            <Link href="/profile" className="text-sm text-blue-600 hover:underline">Edit</Link>
          </div>

          {profile?.resumeUrl ? (
            <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline">
              View resume →
            </a>
          ) : (
            <Link href="/onboarding/resume" className="text-sm text-gray-400 hover:text-gray-600">
              + Upload resume
            </Link>
          )}

          {profile && profile.techSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {profile.techSkills.map((s) => (
                <span key={s.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {s.language} · {s.yearsExp}yr
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Applications list */}
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900">My Applications</h2>

          {(!profile || profile.applications.length === 0) ? (
            <div className="bg-white border border-gray-100 rounded-xl py-16 text-center">
              <p className="text-gray-400 text-sm">No applications yet</p>
              <Link href="/" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
                Browse jobs →
              </Link>
            </div>
          ) : (
            profile.applications.map((app) => (
              <div key={app.id} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Link href={`/jobs/${app.jobId}`}
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                      {app.jobListing.title}
                    </Link>
                    {!app.jobListing.hideCompanyInfo && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {app.jobListing.company.companyName}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span>{app.jobListing.location}</span>
                      <span>·</span>
                      <span>{WORK_TYPE_LABEL[app.jobListing.workType]}</span>
                    </div>
                  </div>

                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_COLOR[app.status]}`}>
                    {STATUS_LABEL[app.status]}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-400">
                    Applied {new Date(app.appliedAt).toLocaleDateString("en-MY", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                    {app.resultMarkedAt && (
                      <> · Result {new Date(app.resultMarkedAt).toLocaleDateString("en-MY", {
                        day: "numeric", month: "short", year: "numeric"
                      })}</>
                    )}
                  </p>
                  {app.status === "SUCCESS" && (
                    <Link href={`/companies/${app.jobListing.company.id}#review`}
                      className="text-xs text-blue-600 hover:underline">
                      Leave a review →
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

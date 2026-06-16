import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { updateApplicationStatus } from "@/app/actions/company"

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  SUCCESS: "bg-green-100 text-green-700",
  FAIL: "bg-red-100 text-red-600",
}

export default async function ApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/company/jobs" className="text-sm text-gray-400 hover:text-gray-600">← Back</Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Applicants</h1>
          <p className="text-sm text-gray-500 mt-0.5">{job.title} · {job.applications.length} total</p>
        </div>
      </div>

      {job.applications.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No applications yet</div>
      ) : (
        <div className="space-y-3">
          {job.applications.map((app) => (
            <div key={app.id} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">
                      {app.interviewee.user.name ?? app.interviewee.user.email}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[app.status]}`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{app.interviewee.user.email}</p>

                  {app.interviewee.techSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {app.interviewee.techSkills.map((s) => (
                        <span key={s.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {s.language} · {s.yearsExp}yr
                        </span>
                      ))}
                    </div>
                  )}

                  {app.interviewee.resumeUrl && (
                    <a
                      href={app.interviewee.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-2 block"
                    >
                      View resume →
                    </a>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    Applied {new Date(app.appliedAt).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>

                {app.status === "PENDING" && (
                  <div className="flex gap-2 shrink-0">
                    <form action={async () => { "use server"; await updateApplicationStatus(app.id, "SUCCESS") }}>
                      <Button size="sm" type="submit" className="bg-green-600 hover:bg-green-700">Mark Hired</Button>
                    </form>
                    <form action={async () => { "use server"; await updateApplicationStatus(app.id, "FAIL") }}>
                      <Button size="sm" variant="outline" type="submit" className="text-red-500 hover:text-red-600">Reject</Button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

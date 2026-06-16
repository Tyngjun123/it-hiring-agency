import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { updateJobStatus, duplicateJob } from "@/app/actions/company"

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PAUSED: "bg-yellow-100 text-yellow-700",
  CLOSED: "bg-gray-100 text-gray-500",
  DRAFT: "bg-blue-100 text-blue-700",
}

export default async function CompanyJobsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const profile = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      jobListings: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { applications: true } } },
      },
    },
  })

  if (!profile) redirect("/company/setup")

  const activeCount = profile.jobListings.filter((j) => j.status === "ACTIVE").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Jobs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeCount} / {profile.plan === "FREE" ? "10" : "∞"} active listings
            {profile.plan === "FREE" && activeCount >= 10 && (
              <span className="ml-2 text-amber-600 font-medium">— Limit reached</span>
            )}
          </p>
        </div>
        <Link href="/company/jobs/new">
          <Button>Post a Job</Button>
        </Link>
      </div>

      {profile.jobListings.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p>No jobs posted yet</p>
          <Link href="/company/jobs/new" className="text-sm text-gray-900 font-medium mt-2 block hover:underline">
            Post your first job →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {profile.jobListings.map((job) => (
            <div key={job.id} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[job.status]}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{job.location} · RM {job.payRangeFrom.toLocaleString()} – {job.payRangeTo.toLocaleString()}</p>
                  <p className="text-sm text-gray-400 mt-1">{job._count.applications} applicant{job._count.applications !== 1 ? "s" : ""}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <Link href={`/company/jobs/${job.id}/applicants`}>
                    <Button variant="outline" size="sm">Applicants</Button>
                  </Link>
                  <Link href={`/company/jobs/${job.id}/edit`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>

                  {job.status === "ACTIVE" && (
                    <form action={async () => { "use server"; await updateJobStatus(job.id, "PAUSED") }}>
                      <Button variant="outline" size="sm" type="submit">Pause</Button>
                    </form>
                  )}
                  {job.status === "PAUSED" && (
                    <form action={async () => { "use server"; await updateJobStatus(job.id, "ACTIVE") }}>
                      <Button variant="outline" size="sm" type="submit">Activate</Button>
                    </form>
                  )}
                  {job.status !== "CLOSED" && (
                    <form action={async () => { "use server"; await updateJobStatus(job.id, "CLOSED") }}>
                      <Button variant="outline" size="sm" type="submit" className="text-red-500 hover:text-red-600">Close</Button>
                    </form>
                  )}
                  <form action={async () => { "use server"; await duplicateJob(job.id) }}>
                    <Button variant="outline" size="sm" type="submit">Duplicate</Button>
                  </form>
                  {job.status === "ACTIVE" && (
                    <Link href={`/company/jobs/${job.id}/boost`}>
                      <Button variant="outline" size="sm" className="text-amber-600 border-amber-200 hover:bg-amber-50">Boost</Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

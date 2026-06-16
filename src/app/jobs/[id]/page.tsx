import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { applyToJob } from "@/app/actions/jobs"

function formatPay(from: number, to: number) {
  return `RM ${from.toLocaleString()} – RM ${to.toLocaleString()}`
}

const WORK_TYPE_LABEL: Record<string, string> = {
  ONSITE: "On-site", REMOTE: "Remote", HYBRID: "Hybrid",
}

const PAY_TYPE_LABEL: Record<string, string> = {
  MONTHLY: "/ month", HOURLY: "/ hour", CONTRACT: "contract",
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

  const job = await prisma.jobListing.findUnique({
    where: { id, status: "ACTIVE" },
    include: {
      company: {
        include: {
          reviews: {
            orderBy: { createdAt: "desc" },
            take: 3,
            include: { reviewer: { include: { user: { select: { name: true } } } } },
          },
        },
      },
    },
  })

  if (!job) notFound()

  // Check if already applied
  let alreadyApplied = false
  if (session?.user?.id && session.user.role === "INTERVIEWEE") {
    const profile = await prisma.intervieweeProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (profile) {
      const existing = await prisma.application.findUnique({
        where: { jobId_intervieweeId: { jobId: id, intervieweeId: profile.id } },
      })
      alreadyApplied = !!existing
    }
  }

  const avgRating = job.company.reviews.length > 0
    ? (job.company.reviews.reduce((sum, r) => sum + r.rating, 0) / job.company.reviews.length).toFixed(1)
    : null

  const applyAction = async () => {
    "use server"
    await applyToJob(id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Back */}
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Back to jobs</Link>

        {/* Job header */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{job.title}</h1>
            {!job.hideCompanyInfo && (
              <p className="text-gray-500 mt-1">{job.company.companyName}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
            <span>{job.location}</span>
            <span>·</span>
            <span>{WORK_TYPE_LABEL[job.workType]}</span>
            <span>·</span>
            <span className="font-medium text-gray-900">
              {formatPay(job.payRangeFrom, job.payRangeTo)} {PAY_TYPE_LABEL[job.payType]}
            </span>
          </div>

          {/* Selling points */}
          <div className="flex flex-wrap gap-2">
            {[job.sellingPoint1, job.sellingPoint2, job.sellingPoint3].map((point, i) => (
              <span key={i} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                {point}
              </span>
            ))}
          </div>

          {/* Apply button */}
          {session?.user?.role === "INTERVIEWEE" && (
            alreadyApplied ? (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
                ✓ You have applied for this role
              </div>
            ) : (
              <form action={applyAction}>
                <Button type="submit" className="w-full sm:w-auto">Apply Now</Button>
              </form>
            )
          )}
          {!session?.user && (
            <Link href={`/login?callbackUrl=/jobs/${id}`}>
              <Button className="w-full sm:w-auto">Sign in to Apply</Button>
            </Link>
          )}
        </div>

        {/* Description */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-3">
          <h2 className="font-semibold text-gray-900">Job Description</h2>
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {job.description}
          </div>
        </div>

        {/* Company info */}
        {!job.hideCompanyInfo && (
          <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-3">
            <h2 className="font-semibold text-gray-900">About {job.company.companyName}</h2>
            {job.company.description && (
              <p className="text-sm text-gray-600">{job.company.description}</p>
            )}
            {job.company.website && (
              <a href={job.company.website} target="_blank" rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline">
                {job.company.website}
              </a>
            )}
            {avgRating && (
              <p className="text-sm text-gray-500">
                ★ {avgRating} · {job.company.reviews.length} review{job.company.reviews.length !== 1 ? "s" : ""}
              </p>
            )}

            {job.company.reviews.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                {job.company.reviews.map((r) => (
                  <div key={r.id}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{r.title}</span>
                      <span className="text-xs text-gray-400">{"★".repeat(r.rating)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{r.body}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {r.reviewer.user.name ?? "Anonymous"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}

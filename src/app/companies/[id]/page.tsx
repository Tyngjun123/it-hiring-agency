import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { submitReview } from "@/app/actions/review"

const WORK_TYPE: Record<string, string> = { ONSITE: "On-site", REMOTE: "Remote", HYBRID: "Hybrid" }

export default async function CompanyProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ reviewed?: string }>
}) {
  const { id } = await params
  const { reviewed } = await searchParams
  const session = await auth()

  const company = await prisma.companyProfile.findUnique({
    where: { id },
    include: {
      jobListings: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { reviewer: { include: { user: { select: { name: true } } } } },
      },
    },
  })
  if (!company) notFound()

  const avgRating = company.reviews.length > 0
    ? (company.reviews.reduce((s, r) => s + r.rating, 0) / company.reviews.length).toFixed(1)
    : null

  // Check if logged-in interviewee can leave a review
  let canReview = false
  let alreadyReviewed = false

  if (session?.user?.id && session.user.role === "INTERVIEWEE") {
    const profile = await prisma.intervieweeProfile.findUnique({ where: { userId: session.user.id } })
    if (profile) {
      const hiredApp = await prisma.application.findFirst({
        where: { intervieweeId: profile.id, status: "SUCCESS", jobListing: { companyId: id } },
      })
      canReview = !!hiredApp
      if (canReview) {
        const existing = await prisma.companyReview.findFirst({ where: { companyId: id, reviewerId: profile.id } })
        alreadyReviewed = !!existing
      }
    }
  }

  const reviewAction = submitReview.bind(null, id)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-6">

        {/* Company header */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-3">
          <h1 className="text-2xl font-semibold text-gray-900">{company.companyName}</h1>
          {avgRating && (
            <p className="text-sm text-gray-500">
              {"★".repeat(Math.round(Number(avgRating)))}{"☆".repeat(5 - Math.round(Number(avgRating)))}
              {" "}<span className="font-medium text-gray-900">{avgRating}</span>
              {" "}· {company.reviews.length} review{company.reviews.length !== 1 ? "s" : ""}
            </p>
          )}
          {company.description && <p className="text-sm text-gray-600">{company.description}</p>}
          {company.website && (
            <a href={company.website} target="_blank" rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline">{company.website}</a>
          )}
        </div>

        {/* Active jobs */}
        {company.jobListings.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-900">Open positions ({company.jobListings.length})</h2>
            {company.jobListings.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}
                className="block bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-300 transition-colors">
                <p className="font-medium text-gray-900">{job.title}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  <span>{job.location}</span>
                  <span>·</span>
                  <span>{WORK_TYPE[job.workType]}</span>
                  <span>·</span>
                  <span>RM {job.payRangeFrom.toLocaleString()} – {job.payRangeTo.toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Reviews */}
        <div className="space-y-3" id="review">
          <h2 className="font-semibold text-gray-900">
            Reviews {company.reviews.length > 0 && <span className="text-gray-400 font-normal">({company.reviews.length})</span>}
          </h2>

          {reviewed === "1" && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
              Review submitted. Thank you!
            </div>
          )}

          {/* Leave review form */}
          {canReview && !alreadyReviewed && reviewed !== "1" && (
            <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
              <h3 className="font-medium text-gray-900">Leave a review</h3>
              <form action={reviewAction} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 font-medium">Rating</label>
                  <select name="rating" required
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white">
                    <option value="">Select rating</option>
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{"★".repeat(r)} {r}/5</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 font-medium">Title</label>
                  <input name="title" required placeholder="e.g. Great place to grow"
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 font-medium">Your experience</label>
                  <textarea name="body" required rows={3} placeholder="Share your honest experience..."
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none" />
                </div>
                <Button type="submit" className="w-full">Submit review</Button>
              </form>
            </div>
          )}

          {company.reviews.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl py-10 text-center text-gray-400 text-sm">
              No reviews yet
            </div>
          ) : (
            company.reviews.map((r) => (
              <div key={r.id} className="bg-white border border-gray-100 rounded-xl p-5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{r.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {r.reviewer.user.name ?? "Anonymous"} ·{" "}
                      {new Date(r.createdAt).toLocaleDateString("en-MY", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <p className="text-amber-500 shrink-0">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                </div>
                <p className="text-sm text-gray-600">{r.body}</p>
              </div>
            ))
          )}
        </div>

      </main>
      <Footer />
    </div>
  )
}

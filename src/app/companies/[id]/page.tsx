import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { submitReview } from "@/app/actions/review"

const AVATAR_PALETTE = [
  { bg: "#E8FBEF", fg: "#067647" },
  { bg: "#FFF7ED", fg: "#EA580C" },
  { bg: "#EFF6FF", fg: "#1D4ED8" },
  { bg: "#FEF2F2", fg: "#DC2626" },
  { bg: "#F5F3FF", fg: "#7C3AED" },
  { bg: "#ECFDF5", fg: "#059669" },
]

function avatarFor(name: string) {
  return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length]
}

const WORK_TYPE: Record<string, string> = { ONSITE: "On-site", REMOTE: "Remote", HYBRID: "Hybrid" }

const WORK_BADGE: Record<string, string> = {
  REMOTE: "bg-[#ECFDF5] text-[#047857]",
  HYBRID: "bg-[#EFF6FF] text-[#1D4ED8]",
  ONSITE: "bg-[#F3F4F6] text-[#4B5563]",
}

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

  const av = avatarFor(company.companyName)
  const avgRating =
    company.reviews.length > 0
      ? (company.reviews.reduce((s, r) => s + r.rating, 0) / company.reviews.length).toFixed(1)
      : null

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
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <Navbar />

      {/* Banner */}
      <div className="h-[130px] w-full" style={{ background: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 50%, #FED7AA 100%)" }} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4">

        {/* Company header — overlaps banner */}
        <div className="-mt-12 mb-6">
          <div className="flex items-end gap-5">
            {/* Avatar */}
            <div className="w-[86px] h-[86px] rounded-[20px] border-4 border-white flex items-center justify-center font-extrabold text-4xl shadow-[0_4px_16px_rgba(28,28,30,0.12)] shrink-0"
              style={{ background: av.bg, color: av.fg }}>
              {company.companyName.charAt(0).toUpperCase()}
            </div>

            <div className="pb-1">
              <h1 className="text-2xl font-extrabold text-[#1C1C1E] tracking-tight">{company.companyName}</h1>
              {avgRating && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[#F59E0B] text-sm">{"★".repeat(Math.round(Number(avgRating)))}</span>
                  <span className="text-sm font-bold text-[#1C1C1E]">{avgRating}</span>
                  <span className="text-xs text-[#9CA3AF]">· {company.reviews.length} review{company.reviews.length !== 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 bg-white border border-[#EEEBE3] rounded-xl px-4 py-3 text-center shadow-[0_1px_2px_rgba(28,28,30,0.03)]">
              <p className="text-xl font-extrabold text-[#F97316]">{company.jobListings.length}</p>
              <p className="text-xs text-[#6B7280] mt-0.5 font-medium">Open roles</p>
            </div>
            <div className="flex-1 bg-white border border-[#EEEBE3] rounded-xl px-4 py-3 text-center shadow-[0_1px_2px_rgba(28,28,30,0.03)]">
              <p className="text-xl font-extrabold text-[#1C1C1E]">{company.reviews.length}</p>
              <p className="text-xs text-[#6B7280] mt-0.5 font-medium">Reviews</p>
            </div>
            {company.website && (
              <div className="flex-1 bg-white border border-[#EEEBE3] rounded-xl px-4 py-3 text-center shadow-[0_1px_2px_rgba(28,28,30,0.03)]">
                <a href={company.website} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-bold text-[#F97316] hover:underline truncate block">
                  Website ↗
                </a>
                <p className="text-xs text-[#6B7280] mt-0.5">{company.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Review submitted banner */}
        {reviewed === "1" && (
          <div className="mb-5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl px-4 py-3 text-sm text-[#047857] font-medium">
            Review submitted. Thank you!
          </div>
        )}

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 pb-12">

          {/* Left: About + Jobs */}
          <div className="space-y-5">

            {/* About */}
            {company.description && (
              <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
                <h2 className="text-base font-bold text-[#1C1C1E] mb-3">About {company.companyName}</h2>
                <p className="text-sm text-[#4B5563] leading-relaxed">{company.description}</p>
              </div>
            )}

            {/* Active jobs */}
            <div className="bg-white border border-[#EEEBE3] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#F4F1EA]">
                <h2 className="text-base font-bold text-[#1C1C1E]">Open positions</h2>
                <span className="text-sm font-bold text-[#F97316]">{company.jobListings.length}</span>
              </div>

              {company.jobListings.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-[#9CA3AF]">No open positions at the moment</p>
                </div>
              ) : (
                <div className="divide-y divide-[#F4F1EA]">
                  {company.jobListings.map((job) => (
                    <Link key={job.id} href={`/jobs/${job.id}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-[#FDFCFA] transition-colors group">
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-[#1C1C1E] group-hover:text-[#F97316] transition-colors">{job.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[#9CA3AF]">{job.location}</span>
                          <span className="text-[#E6E2D9]">·</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${WORK_BADGE[job.workType] ?? "bg-[#F3F4F6] text-[#4B5563]"}`}>
                            {WORK_TYPE[job.workType]}
                          </span>
                          <span className="text-[#E6E2D9]">·</span>
                          <span className="text-xs text-[#9CA3AF]">RM {job.payRangeFrom.toLocaleString()} – {job.payRangeTo.toLocaleString()}</span>
                        </div>
                      </div>
                      <span className="text-[#C7C3B9] group-hover:text-[#F97316] transition-colors ml-4 shrink-0">→</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right: Reviews */}
          <div className="space-y-4">
            <div className="bg-white border border-[#EEEBE3] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
              <div className="px-5 py-4 border-b border-[#F4F1EA]">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#1C1C1E]">Reviews</h2>
                  {avgRating && (
                    <div className="flex items-center gap-1">
                      <span className="text-[#F59E0B]">★</span>
                      <span className="text-sm font-bold text-[#1C1C1E]">{avgRating}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Leave review form */}
              {canReview && !alreadyReviewed && reviewed !== "1" && (
                <div className="px-5 py-4 border-b border-[#F4F1EA] bg-[#FFFBF5]">
                  <p className="text-sm font-bold text-[#1C1C1E] mb-3">Leave a review</p>
                  <form action={reviewAction} className="space-y-3">
                    <select name="rating" required
                      className="w-full border border-[#E6E2D9] rounded-xl px-3 py-2 text-sm bg-white focus:border-[#F97316] focus:outline-none">
                      <option value="">Select rating</option>
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>{"★".repeat(r)} {r}/5</option>
                      ))}
                    </select>
                    <input name="title" required placeholder="Review title"
                      className="w-full border border-[#E6E2D9] rounded-xl px-3 py-2 text-sm focus:border-[#F97316] focus:outline-none" />
                    <textarea name="body" required rows={3} placeholder="Share your experience..."
                      className="w-full border border-[#E6E2D9] rounded-xl px-3 py-2 text-sm focus:border-[#F97316] focus:outline-none resize-none" />
                    <button type="submit"
                      className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold py-2.5 rounded-[11px] transition-colors">
                      Submit review
                    </button>
                  </form>
                </div>
              )}

              {company.reviews.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-[#9CA3AF]">No reviews yet</p>
                </div>
              ) : (
                <div className="divide-y divide-[#F4F1EA]">
                  {company.reviews.map((r) => (
                    <div key={r.id} className="px-5 py-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#1C1C1E]">{r.title}</p>
                          <p className="text-xs text-[#9CA3AF] mt-0.5">
                            {r.reviewer.user.name ?? "Anonymous"} ·{" "}
                            {new Date(r.createdAt).toLocaleDateString("en-MY", { month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <span className="text-[#F59E0B] shrink-0 text-sm">{"★".repeat(r.rating)}</span>
                      </div>
                      <p className="text-sm text-[#4B5563] leading-relaxed">{r.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  )
}

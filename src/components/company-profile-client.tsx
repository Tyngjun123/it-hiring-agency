"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { useLockBodyScroll } from "@/lib/use-lock-body-scroll"

export const REVIEW_DEPARTMENTS = [
  "Engineering / Software Development",
  "Quality Assurance (QA)",
  "DevOps / Infrastructure",
  "Data / Analytics",
  "Product Management",
  "Design (UI/UX)",
  "Project Management",
  "IT Support / Helpdesk",
  "Cybersecurity",
  "Business Analysis",
  "Sales & Marketing",
  "Human Resources",
  "Finance / Admin",
  "Other",
]

// ─── Types ────────────────────────────────────────────────────────────────────

type Review = {
  id: string
  rating: number
  title: string
  body: string
  department?: string | null
  createdAt: string
  reviewer: { user: { name: string | null } }
}

type Job = {
  id: string
  title: string
  location: string
  workType: string
  payRangeFrom: number
  payRangeTo: number
}

type Props = {
  company: {
    id: string
    companyName: string
    logoUrl: string | null
    description: string | null
    website: string | null
    linkedinUrl: string | null
  }
  reviews: Review[]
  jobs: Job[]
  avgRating: string | null
  canReview: boolean
  alreadyReviewed: boolean
  reviewAction: (fd: FormData) => Promise<{ error?: string }>
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: "#E8FBEF", fg: "#067647" }, { bg: "#FFF7ED", fg: "#EA580C" },
  { bg: "#EFF6FF", fg: "#1D4ED8" }, { bg: "#FEF2F2", fg: "#DC2626" },
  { bg: "#F5F3FF", fg: "#7C3AED" }, { bg: "#ECFDF5", fg: "#059669" },
]
function avatarFor(name: string) {
  return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length]
}

const WORK_BADGE: Record<string, { bg: string; fg: string; label: string }> = {
  REMOTE: { bg: "#ECFDF5", fg: "#047857", label: "Remote" },
  HYBRID: { bg: "#EFF6FF", fg: "#1D4ED8", label: "Hybrid" },
  ONSITE: { bg: "#F3F4F6", fg: "#4B5563", label: "On-site" },
}

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "text-[20px]" : "text-[14px]"
  return (
    <span className={cls} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? "#F97316" : "#F2D9C2" }}>★</span>
      ))}
    </span>
  )
}

function ReviewCard({ r }: { r: Review }) {
  const av = avatarFor(r.reviewer.user.name ?? "A")
  const name = r.reviewer.user.name ?? "Anonymous"
  return (
    <div className="py-4 border-t border-[#F4F1EA] first:border-0 first:pt-0">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
            style={{ background: av.bg, color: av.fg }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-[13.5px] font-bold text-[#1C1C1E] leading-tight">{name}</p>
            <p className="text-[11.5px] text-[#9CA3AF]">
              {new Date(r.createdAt).toLocaleDateString("en-MY", { month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
        <Stars rating={r.rating} />
      </div>
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <p className="text-[13px] font-semibold text-[#1C1C1E]">{r.title}</p>
        {r.department && (
          <span className="text-[10.5px] font-bold bg-[#EFF6FF] text-[#1D4ED8] px-2 py-0.5 rounded-full">
            {r.department}
          </span>
        )}
      </div>
      <p className="text-[13px] text-[#4B5563] leading-relaxed">{r.body}</p>
    </div>
  )
}

// ─── Write Review Modal ───────────────────────────────────────────────────────

function WriteReviewModal({
  onClose,
  reviewAction,
}: {
  onClose: () => void
  reviewAction: (fd: FormData) => Promise<{ error?: string }>
}) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [department, setDepartment] = useState("")
  const [otherDept, setOtherDept] = useState("")
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  useLockBodyScroll()

  const canSubmit =
    rating > 0 &&
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    department.length > 0 &&
    (department !== "Other" || otherDept.trim().length > 0)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)
    const fd = new FormData(e.currentTarget)
    fd.set("rating", String(rating))
    // If "Other", store the custom department text instead of the literal "Other".
    if (department === "Other") fd.set("department", otherDept.trim())
    startTransition(async () => {
      const result = await reviewAction(fd)
      if (result?.error) {
        setServerError(result.error)
      } else {
        setDone(true)
        toast.success("Review posted")
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#1C1C1E]/50 backdrop-blur-[2px] md:p-4">
      <div className="bg-white rounded-t-[22px] md:rounded-[20px] w-full md:max-w-md shadow-[0_-4px_30px_rgba(28,28,30,0.18)] md:shadow-[0_30px_70px_rgba(28,28,30,0.28)] max-h-[88vh] overflow-y-auto">
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-9 h-1 rounded-full bg-[#D6D2C8]" />
        </div>
        {done ? (
          <div className="p-8 md:p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-[#ECFDF5] flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
            <h2 className="text-[20px] font-extrabold text-[#1C1C1E] mb-2">Review submitted!</h2>
            <p className="text-[14px] text-[#6B7280] mb-6">Thank you for sharing your experience.</p>
            <button onClick={onClose}
              className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-3 rounded-[12px] transition-colors">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 md:px-7 pt-5 md:pt-7 pb-5 border-b border-[#F4F1EA]">
              <h2 className="text-[20px] font-extrabold text-[#1C1C1E] tracking-tight">Write a review</h2>
              <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#1C1C1E] text-[20px] leading-none transition-colors">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
              {/* Star selector */}
              <div>
                <label className="block text-[13px] font-bold text-[#3A3A3C] mb-2">Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button key={i} type="button"
                      onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
                      onClick={() => setRating(i)}
                      className="text-[30px] transition-transform hover:scale-110 leading-none">
                      <span style={{ color: i <= (hover || rating) ? "#F97316" : "#E6E2D9" }}>★</span>
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-[12.5px] text-[#9CA3AF] mt-1.5">
                    {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-bold text-[#3A3A3C] mb-1.5">Department</label>
                <select name="department" required value={department} onChange={(e) => setDepartment(e.target.value)}
                  className="w-full border border-[#E6E2D9] rounded-[11px] px-3.5 py-3 text-[14px] text-[#1C1C1E] bg-white focus:outline-none focus:border-[#F97316] transition-colors">
                  <option value="" disabled>Select your department</option>
                  {REVIEW_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {department === "Other" && (
                  <input value={otherDept} onChange={(e) => setOtherDept(e.target.value)} required
                    placeholder="Please specify your department"
                    className="w-full border border-[#E6E2D9] rounded-[11px] px-3.5 py-3 text-[14px] text-[#1C1C1E] placeholder-[#A8A49A] focus:outline-none focus:border-[#F97316] transition-colors" />
                )}
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#3A3A3C] mb-1.5">Title</label>
                <input name="title" required value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarise your experience"
                  className="w-full border border-[#E6E2D9] rounded-[11px] px-3.5 py-3 text-[14px] text-[#1C1C1E] placeholder-[#A8A49A] focus:outline-none focus:border-[#F97316] transition-colors" />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#3A3A3C] mb-1.5">Your review</label>
                <textarea name="body" required rows={4} value={body} onChange={(e) => setBody(e.target.value)}
                  placeholder="What was it like working here? Culture, growth, management..."
                  className="w-full border border-[#E6E2D9] rounded-[11px] px-3.5 py-3 text-[14px] text-[#1C1C1E] placeholder-[#A8A49A] focus:outline-none focus:border-[#F97316] transition-colors resize-none" />
              </div>

              {serverError && (
                <p className="text-[12.5px] text-[#DC2626] font-medium">
                  {serverError === "already-reviewed"
                    ? "You have already reviewed this company."
                    : serverError === "invalid"
                    ? "Please add a rating, a title and your review (spaces only won't count)."
                    : "Something went wrong. Please try again."}
                </p>
              )}

              <button type="submit" disabled={isPending || !canSubmit}
                className="w-full bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[15px] py-3.5 rounded-[12px] shadow-[0_8px_18px_rgba(249,115,22,0.3)] transition-colors">
                {isPending ? "Submitting…" : "Submit review"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

// ─── All Reviews Modal ────────────────────────────────────────────────────────

function AllReviewsModal({ reviews, avgRating, companyName, onClose }: {
  reviews: Review[]
  avgRating: string | null
  companyName: string
  onClose: () => void
}) {
  const ratingNum = avgRating ? Number(avgRating) : 0
  const breakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(r.rating) === star).length,
    pct: reviews.length > 0
      ? (reviews.filter(r => Math.round(r.rating) === star).length / reviews.length) * 100
      : 0,
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#1C1C1E]/50 backdrop-blur-[2px] md:p-4">
      <div className="bg-white rounded-t-[22px] md:rounded-[20px] w-full md:max-w-lg max-h-[85vh] flex flex-col shadow-[0_-4px_30px_rgba(28,28,30,0.18)] md:shadow-[0_30px_70px_rgba(28,28,30,0.28)]">
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 md:hidden shrink-0">
          <div className="w-9 h-1 rounded-full bg-[#D6D2C8]" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-6 md:px-7 pt-4 md:pt-7 pb-5 border-b border-[#F4F1EA] shrink-0">
          <div>
            <h2 className="text-[20px] font-extrabold text-[#1C1C1E] tracking-tight">
              Reviews · {companyName}
            </h2>
            <p className="text-[13px] text-[#9CA3AF] mt-0.5">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#1C1C1E] text-[20px] leading-none transition-colors">✕</button>
        </div>

        {/* Rating summary */}
        {avgRating && (
          <div className="px-7 py-5 border-b border-[#F4F1EA] shrink-0">
            <div className="flex items-center gap-5">
              <div className="text-center">
                <p className="text-[44px] font-extrabold text-[#1C1C1E] leading-none">{avgRating}</p>
                <Stars rating={ratingNum} size="sm" />
                <p className="text-[11.5px] text-[#9CA3AF] mt-1">out of 5</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {breakdown.map(({ star, count, pct }) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-[12px] text-[#9CA3AF] w-3 shrink-0">{star}</span>
                    <span className="text-[#F97316] text-[11px]">★</span>
                    <div className="flex-1 h-1.5 bg-[#F4F1EA] rounded-full overflow-hidden">
                      <div className="h-full bg-[#F97316] rounded-full transition-all"
                        style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11.5px] text-[#9CA3AF] w-4 shrink-0 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Review list */}
        <div className="overflow-y-auto flex-1 px-6 md:px-7 py-4">
          {reviews.length === 0 ? (
            <p className="text-center text-[14px] text-[#9CA3AF] py-8">No reviews yet</p>
          ) : (
            reviews.map(r => <ReviewCard key={r.id} r={r} />)
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main client component ────────────────────────────────────────────────────

type Tab = "About" | "Jobs" | "Reviews"

export default function CompanyProfileClient({
  company, reviews, jobs, avgRating, canReview, alreadyReviewed, reviewAction,
}: Props) {
  const [tab, setTab] = useState<Tab>("About")
  const [showWriteReview, setShowWriteReview] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const av = avatarFor(company.companyName)

  return (
    <>
      {/* Modals */}
      {showWriteReview && (
        <WriteReviewModal
          onClose={() => setShowWriteReview(false)}
          reviewAction={reviewAction}
        />
      )}
      {showAllReviews && (
        <AllReviewsModal
          reviews={reviews}
          avgRating={avgRating}
          companyName={company.companyName}
          onClose={() => setShowAllReviews(false)}
        />
      )}

      {/* Company header */}
      <div className="-mt-12 mb-6 px-4">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="flex items-end gap-5">
            {/* Logo / avatar */}
            {company.logoUrl ? (
              <div className="w-[86px] h-[86px] rounded-[20px] border-4 border-white overflow-hidden shadow-[0_8px_22px_rgba(28,28,30,0.10)] shrink-0 bg-white">
                <Image src={company.logoUrl} alt={company.companyName} width={86} height={86} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-[86px] h-[86px] rounded-[20px] border-4 border-white flex items-center justify-center font-extrabold text-[36px] shadow-[0_8px_22px_rgba(28,28,30,0.10)] shrink-0"
                style={{ background: av.bg, color: av.fg }}>
                {company.companyName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="pb-1">
              <h1 className="text-[27px] font-extrabold text-[#1C1C1E] tracking-tight mb-1">{company.companyName}</h1>
              {avgRating && (
                <div className="flex items-center gap-2 mt-0.5">
                  <Stars rating={Number(avgRating)} />
                  <span className="text-[14px] font-bold text-[#1C1C1E]">{avgRating}</span>
                  <span className="text-[12.5px] text-[#9CA3AF]">· {reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5 items-center pb-1">
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer"
                className="border border-[#E6E2D9] text-[#3A3A3C] text-[14px] font-bold px-5 py-2.5 rounded-[11px] bg-white hover:border-[#F97316] hover:text-[#F97316] transition-colors">
                Website ↗
              </a>
            )}
            {canReview && !alreadyReviewed && (
              <button onClick={() => setShowWriteReview(true)}
                className="bg-[#F97316] hover:bg-[#EA580C] text-white text-[14px] font-bold px-5 py-2.5 rounded-[11px] shadow-[0_6px_15px_rgba(249,115,22,0.3)] transition-colors">
                Write a review
              </button>
            )}
          </div>
        </div>

        {/* Stats — compact 3-col on all sizes */}
        <div className="grid grid-cols-3 gap-2 md:gap-3.5 mt-5">
          <div className="bg-white border border-[#EEEBE3] rounded-[14px] px-3 md:px-5 py-3 md:py-4 shadow-[0_1px_2px_rgba(28,28,30,0.03)]">
            <p className="text-[20px] md:text-[23px] font-extrabold text-[#F97316]">{jobs.length}</p>
            <p className="text-[12px] md:text-[13px] text-[#6B7280] mt-0.5 leading-tight">Open tech roles</p>
          </div>
          <div className="bg-white border border-[#EEEBE3] rounded-[14px] px-3 md:px-5 py-3 md:py-4 shadow-[0_1px_2px_rgba(28,28,30,0.03)]">
            <p className="text-[20px] md:text-[23px] font-extrabold text-[#1C1C1E]">{reviews.length}</p>
            <p className="text-[12px] md:text-[13px] text-[#6B7280] mt-0.5 leading-tight">Reviews</p>
          </div>
          <div className="bg-white border border-[#EEEBE3] rounded-[14px] px-3 md:px-5 py-3 md:py-4 shadow-[0_1px_2px_rgba(28,28,30,0.03)]">
            <p className="text-[20px] md:text-[23px] font-extrabold text-[#1C1C1E]">{avgRating ?? "—"}</p>
            <p className="text-[12px] md:text-[13px] text-[#6B7280] mt-0.5 leading-tight">Avg rating</p>
          </div>
        </div>

        {/* Tabs — horizontally scrollable on mobile */}
        <div className="flex gap-1 border-b border-[#ECE9E1] mt-6 overflow-x-auto scrollbar-hide">
          {(["About", "Jobs", "Reviews"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`text-[14.5px] font-bold px-5 py-3 transition-colors border-b-[2.5px] -mb-px ${
                tab === t
                  ? "text-[#F97316] border-[#F97316]"
                  : "text-[#9CA3AF] border-transparent hover:text-[#6B7280]"
              }`}>
              {t}
              {t === "Reviews" && reviews.length > 0 && (
                <span className="ml-1.5 text-[11px] font-bold text-[#9CA3AF]">({reviews.length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 pb-12">

        {/* About */}
        {tab === "About" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
            <div className="space-y-6">
              {company.description ? (
                <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
                  <h3 className="text-[17px] font-bold text-[#1C1C1E] mb-3">About {company.companyName}</h3>
                  <p className="text-[15px] text-[#3A3A3C] leading-[1.7]">{company.description}</p>
                </div>
              ) : (
                <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 text-center text-[#9CA3AF] text-sm shadow-sm">
                  No description added yet.
                </div>
              )}

              {/* Quick links */}
              {(company.website || company.linkedinUrl) && (
                <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
                  <h3 className="text-[13px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-3">Links</h3>
                  <div className="space-y-2">
                    {company.website && (
                      <a href={company.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[14px] font-semibold text-[#F97316] hover:underline">
                        🌐 {company.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </a>
                    )}
                    {company.linkedinUrl && (
                      <a href={company.linkedinUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[14px] font-semibold text-[#0A66C2] hover:underline">
                        in LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews sidebar */}
            <div className="bg-white border border-[#EEEBE3] rounded-2xl p-5 shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
              {avgRating ? (
                <>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="text-[38px] font-extrabold text-[#1C1C1E] leading-none">{avgRating}</div>
                    <div>
                      <Stars rating={Number(avgRating)} size="lg" />
                      <p className="text-[12.5px] text-[#9CA3AF] mt-1">From {reviews.length} employee reviews</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {reviews.slice(0, 2).map(r => <ReviewCard key={r.id} r={r} />)}
                  </div>
                  {reviews.length > 2 && (
                    <button onClick={() => setShowAllReviews(true)}
                      className="mt-4 w-full text-center text-[14px] font-bold text-[#F97316] hover:text-[#EA580C] py-2.5 border border-[#FBDDBE] rounded-[11px] hover:bg-[#FFF7ED] transition-colors">
                      See all {reviews.length} reviews →
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-[28px] font-extrabold text-[#D9D5CC] mb-1">—</p>
                  <p className="text-[13px] text-[#9CA3AF] mb-3">No reviews yet</p>
                  {canReview && !alreadyReviewed ? (
                    <button onClick={() => setShowWriteReview(true)}
                      className="text-[13.5px] font-bold text-white bg-[#F97316] hover:bg-[#EA580C] px-4 py-2 rounded-[10px] transition-colors shadow-[0_4px_10px_rgba(249,115,22,0.3)]">
                      Be the first to review
                    </button>
                  ) : alreadyReviewed ? (
                    <p className="text-[12.5px] text-[#9CA3AF]">You have already reviewed this company.</p>
                  ) : (
                    <p className="text-[12.5px] text-[#9CA3AF]">Sign in as a candidate to review.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Jobs */}
        {tab === "Jobs" && (
          <div className="space-y-3">
            <h3 className="text-[17px] font-bold text-[#1C1C1E] mb-4">
              Active jobs <span className="text-[#9CA3AF] font-semibold">· {jobs.length}</span>
            </h3>
            {jobs.length === 0 ? (
              <div className="bg-white border border-[#EEEBE3] rounded-2xl py-14 text-center text-[#9CA3AF] text-sm shadow-sm">
                No open positions at the moment.
              </div>
            ) : (
              jobs.map(job => {
                const badge = WORK_BADGE[job.workType]
                return (
                  <Link key={job.id} href={`/jobs/${job.id}`}
                    className="flex items-center justify-between gap-4 bg-white border border-[#EEEBE3] rounded-[14px] px-5 py-4 shadow-[0_1px_2px_rgba(28,28,30,0.03)] hover:shadow-[0_4px_16px_rgba(28,28,30,0.08)] transition-shadow group">
                    <div className="min-w-0">
                      <p className="text-[15px] font-bold text-[#1C1C1E] group-hover:text-[#F97316] transition-colors">{job.title}</p>
                      <p className="text-[13px] text-[#6B7280] mt-0.5">
                        {job.location} · RM {job.payRangeFrom.toLocaleString()}–{job.payRangeTo.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {badge && (
                        <span className="text-[11.5px] font-bold px-3 py-1 rounded-full"
                          style={{ background: badge.bg, color: badge.fg }}>
                          {badge.label}
                        </span>
                      )}
                      <span className="text-[13px] font-bold text-[#F97316]">View →</span>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        )}

        {/* Reviews */}
        {tab === "Reviews" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
            <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[17px] font-bold text-[#1C1C1E]">
                  All reviews <span className="text-[#9CA3AF] font-semibold">· {reviews.length}</span>
                </h3>
                <div className="flex items-center gap-2">
                  {reviews.length > 0 && (
                    <button onClick={() => setShowAllReviews(true)}
                      className="text-[13.5px] font-bold text-[#F97316] hover:text-[#EA580C] px-4 py-2 rounded-[10px] border border-[#FBDDBE] hover:bg-[#FFF7ED] transition-colors">
                      See all →
                    </button>
                  )}
                  {canReview && !alreadyReviewed && (
                    <button onClick={() => setShowWriteReview(true)}
                      className="text-[13.5px] font-bold text-white bg-[#F97316] hover:bg-[#EA580C] px-4 py-2 rounded-[10px] transition-colors shadow-[0_4px_10px_rgba(249,115,22,0.3)]">
                      Write a review
                    </button>
                  )}
                </div>
              </div>
              {reviews.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-[14px] text-[#9CA3AF] mb-4">No reviews yet. Be the first!</p>
                  {canReview && !alreadyReviewed && (
                    <button onClick={() => setShowWriteReview(true)}
                      className="text-[13.5px] font-bold text-white bg-[#F97316] hover:bg-[#EA580C] px-5 py-2.5 rounded-[10px] transition-colors shadow-[0_4px_10px_rgba(249,115,22,0.3)]">
                      Write a review
                    </button>
                  )}
                </div>
              ) : (
                reviews.map(r => <ReviewCard key={r.id} r={r} />)
              )}
            </div>

            {/* Rating summary card */}
            {avgRating && (
              <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
                <p className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-4">Overall rating</p>
                <div className="flex items-center gap-4 mb-5">
                  <p className="text-[44px] font-extrabold text-[#1C1C1E] leading-none">{avgRating}</p>
                  <div>
                    <Stars rating={Number(avgRating)} size="lg" />
                    <p className="text-[12px] text-[#9CA3AF] mt-1">out of 5</p>
                  </div>
                </div>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.filter(r => Math.round(r.rating) === star).length
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-2 mb-1.5">
                      <span className="text-[12px] text-[#9CA3AF] w-3">{star}</span>
                      <span className="text-[#F97316] text-[11px]">★</span>
                      <div className="flex-1 h-1.5 bg-[#F4F1EA] rounded-full overflow-hidden">
                        <div className="h-full bg-[#F97316] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11.5px] text-[#9CA3AF] w-4 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

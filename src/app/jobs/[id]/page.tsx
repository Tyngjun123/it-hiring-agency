import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import JobCard from "@/components/job-card"
import { getSiteUrl } from "@/lib/site-url"
import ShareButtons from "@/components/share-buttons"
import ApplyButton from "@/components/apply-button"
import SaveJobButton from "@/components/save-job-button"
import type { Metadata } from "next"

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

const WORK_TYPE_LABEL: Record<string, string> = {
  ONSITE: "On-site", REMOTE: "Remote", HYBRID: "Hybrid",
}

const WORK_TYPE_STYLE: Record<string, string> = {
  REMOTE: "bg-[#ECFDF5] text-[#047857]",
  HYBRID: "bg-[#EFF6FF] text-[#1D4ED8]",
  ONSITE: "bg-[#F3F4F6] text-[#4B5563]",
}

const PAY_TYPE_LABEL: Record<string, string> = {
  MONTHLY: "/ month", HOURLY: "/ hour", CONTRACT: "contract",
}

const EMPLOYMENT_TYPE_LABEL: Record<string, string> = {
  FULL_TIME: "Full-time", PART_TIME: "Part-time", CONTRACT: "Contract",
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const job = await prisma.jobListing.findUnique({
    where: { id, status: "ACTIVE" },
    include: { company: { select: { companyName: true } } },
  })
  if (!job) return { title: "Job not found | StackTalentx" }

  const companyName = job.hideCompanyInfo ? "a hiring company" : job.company.companyName
  const payRange = `RM ${job.payRangeFrom.toLocaleString()}–${job.payRangeTo.toLocaleString()}`
  const title = `${job.title} at ${companyName} | StackTalentx`
  const description =
    `${job.title} (${WORK_TYPE_LABEL[job.workType] ?? job.workType}, ${job.location}) — ${payRange}. ` +
    `${job.sellingPoint1}. Apply now on StackTalentx, Malaysia's IT job board.`
  const url = `${getSiteUrl()}/jobs/${id}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "StackTalentx",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
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
          _count: { select: { jobListings: { where: { status: "ACTIVE" } } } },
        },
      },
    },
  })

  if (!job) notFound()

  let alreadyApplied = false
  let isSaved = false
  const isSeeker = session?.user?.role === "INTERVIEWEE"
  if (session?.user?.id && isSeeker) {
    const profile = await prisma.intervieweeProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (profile) {
      const [existing, saved] = await Promise.all([
        prisma.application.findUnique({
          where: { jobId_intervieweeId: { jobId: id, intervieweeId: profile.id } },
        }),
        prisma.savedJob.findUnique({
          where: { intervieweeId_jobId: { intervieweeId: profile.id, jobId: id } },
        }),
      ])
      alreadyApplied = !!existing
      isSaved = !!saved
    }
  }

  const avgRating =
    job.company.reviews.length > 0
      ? (job.company.reviews.reduce((sum, r) => sum + r.rating, 0) / job.company.reviews.length).toFixed(1)
      : null

  const av = avatarFor(job.company.companyName)
  const workBadge = WORK_TYPE_STYLE[job.workType] ?? "bg-[#F3F4F6] text-[#4B5563]"
  const jobUrl = `${getSiteUrl()}/jobs/${id}`
  const shareTitle = `${job.title}${job.hideCompanyInfo ? "" : ` at ${job.company.companyName}`}`

  // ── Google Jobs structured data (JSON-LD) ──
  const EMPLOYMENT_TYPE_LD: Record<string, string> = { FULL_TIME: "FULL_TIME", PART_TIME: "PART_TIME", CONTRACT: "CONTRACTOR" }
  const PAY_UNIT_LD: Record<string, string> = { MONTHLY: "MONTH", HOURLY: "HOUR", CONTRACT: "MONTH" }
  const jobLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.createdAt.toISOString(),
    validThrough: (job.expiresAt ?? new Date(job.createdAt.getTime() + 60 * 86_400_000)).toISOString(),
    employmentType: EMPLOYMENT_TYPE_LD[job.employmentType] ?? "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.hideCompanyInfo ? "Confidential" : job.company.companyName,
      ...(!job.hideCompanyInfo && job.company.website ? { sameAs: job.company.website } : {}),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location || "Malaysia",
        addressCountry: "MY",
      },
    },
    ...(job.workType === "REMOTE"
      ? { jobLocationType: "TELECOMMUTE", applicantLocationRequirements: { "@type": "Country", name: "Malaysia" } }
      : {}),
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "MYR",
      value: {
        "@type": "QuantitativeValue",
        minValue: job.payRangeFrom,
        maxValue: job.payRangeTo,
        unitText: PAY_UNIT_LD[job.payType] ?? "MONTH",
      },
    },
    identifier: {
      "@type": "PropertyValue",
      name: job.hideCompanyInfo ? "Confidential" : job.company.companyName,
      value: job.id,
    },
  }

  // Similar jobs — same work type or location, most recent/hot first
  const relatedJobs = await prisma.jobListing.findMany({
    where: {
      status: "ACTIVE",
      id: { not: id },
      OR: [{ workType: job.workType }, { location: job.location }],
    },
    include: { company: true },
    orderBy: [{ isHot: "desc" }, { priority: "desc" }, { createdAt: "desc" }],
    take: 3,
  })

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobLd) }} />
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 pb-24 lg:pb-8">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#9CA3AF] hover:text-[#1C1C1E] transition-colors mb-6">
          ← Back to jobs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

          {/* ── Left: main content ── */}
          <div className="space-y-4">

            {/* Job header card */}
            <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">

              {/* Company row */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-[13px] flex items-center justify-center font-extrabold text-lg shrink-0"
                  style={{ background: av.bg, color: av.fg }}>
                  {job.company.companyName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <Link href={`/companies/${job.company.id}`}
                    className="text-sm font-bold text-[#6B7280] hover:text-[#F97316] transition-colors">
                    {job.hideCompanyInfo ? "Confidential company" : job.company.companyName}
                  </Link>
                  {avgRating && (
                    <p className="text-xs text-[#9CA3AF]">★ {avgRating} · {job.company.reviews.length} review{job.company.reviews.length !== 1 ? "s" : ""}</p>
                  )}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-extrabold text-[#1C1C1E] tracking-tight leading-tight">{job.title}</h1>

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${workBadge}`}>
                  {WORK_TYPE_LABEL[job.workType]}
                </span>
                <span className="text-xs font-bold bg-[#EFF6FF] text-[#1D4ED8] px-2.5 py-1 rounded-full">
                  {EMPLOYMENT_TYPE_LABEL[job.employmentType] ?? "Full-time"}
                </span>
                {job.location && (
                  <span className="text-xs font-bold bg-[#F3F4F6] text-[#4B5563] px-2.5 py-1 rounded-full">
                    {job.location}
                  </span>
                )}
              </div>

              {/* Salary highlight */}
              <div className="mt-4 bg-[#FFF7ED] border border-[#FBDDBE] rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-[#C2410C] uppercase tracking-widest">Monthly Salary</p>
                  <p className="text-xl font-extrabold text-[#F97316] mt-0.5">
                    RM {job.payRangeFrom.toLocaleString()} – RM {job.payRangeTo.toLocaleString()}
                  </p>
                </div>
                <span className="text-xs text-[#C2410C] font-medium">{PAY_TYPE_LABEL[job.payType]}</span>
              </div>

              {/* Selling point pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                {[job.sellingPoint1, job.sellingPoint2, job.sellingPoint3].filter(Boolean).map((point, i) => (
                  <span key={i} className="text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FBDDBE] px-3 py-1 rounded-full">
                    {point}
                  </span>
                ))}
              </div>

              {/* Required tech skills */}
              {job.requiredSkills.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">Tech skills</p>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((s) => (
                      <span key={s} className="text-xs font-semibold bg-[#EFF6FF] text-[#1D4ED8] px-3 py-1 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
              <h2 className="text-base font-bold text-[#1C1C1E] mb-4">Job Description</h2>
              <div className="text-sm text-[#4B5563] whitespace-pre-wrap leading-relaxed">
                {job.description}
              </div>
            </div>

          </div>

          {/* ── Right: sticky sidebar ── */}
          <div className="space-y-4 lg:sticky lg:top-6">

            {/* Apply card */}
            <div className="bg-white border border-[#EEEBE3] rounded-2xl p-5 shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-3">Apply for this role</p>

              {isSeeker ? (
                <div className="space-y-2.5">
                  {alreadyApplied ? (
                    <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl px-4 py-3 text-sm font-bold text-[#047857] text-center">
                      ✓ Applied
                    </div>
                  ) : (
                    <ApplyButton jobId={id} jobTitle={job.title} questions={job.questions}
                      className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-3 rounded-[11px] shadow-[0_6px_15px_rgba(249,115,22,0.3)] transition-colors text-sm" />
                  )}
                  <SaveJobButton jobId={id} initialSaved={isSaved} variant="labeled" />
                </div>
              ) : session?.user?.role === "COMPANY" ? (
                <p className="text-xs text-[#9CA3AF] text-center">Company accounts cannot apply</p>
              ) : (
                <Link href={`/login?callbackUrl=/jobs/${id}`}
                  className="block w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-3 rounded-[11px] shadow-[0_6px_15px_rgba(249,115,22,0.3)] transition-colors text-sm text-center">
                  Sign in to Apply
                </Link>
              )}

              <Link href={`/companies/${job.company.id}`}
                className="block mt-3 text-center text-xs font-semibold text-[#9CA3AF] hover:text-[#F97316] transition-colors">
                View company profile →
              </Link>

              <div className="mt-4 pt-4 border-t border-[#F4F1EA]">
                <ShareButtons url={jobUrl} title={shareTitle} variant="compact" />
              </div>
            </div>

            {/* Company card */}
            {!job.hideCompanyInfo && (
              <div className="bg-white border border-[#EEEBE3] rounded-2xl p-5 shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-[12px] flex items-center justify-center font-extrabold text-lg shrink-0"
                    style={{ background: av.bg, color: av.fg }}>
                    {job.company.companyName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1C1C1E]">{job.company.companyName}</p>
                    <p className="text-xs text-[#F97316] font-bold">{job.company._count.jobListings} open role{job.company._count.jobListings !== 1 ? "s" : ""}</p>
                  </div>
                </div>

                {job.company.description && (
                  <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-3">{job.company.description}</p>
                )}

                {job.company.website && (
                  <a href={job.company.website} target="_blank" rel="noopener noreferrer"
                    className="mt-2 text-xs font-semibold text-[#F97316] hover:underline block truncate">
                    {job.company.website.replace(/^https?:\/\//, "")} ↗
                  </a>
                )}

                {avgRating && (
                  <div className="mt-3 pt-3 border-t border-[#F4F1EA]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#F59E0B] text-sm">★</span>
                      <span className="text-sm font-bold text-[#1C1C1E]">{avgRating}</span>
                      <span className="text-xs text-[#9CA3AF]">· {job.company.reviews.length} review{job.company.reviews.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Similar jobs */}
        {relatedJobs.length > 0 && (
          <div className="mt-10">
            <h2 className="text-base font-bold text-[#1C1C1E] mb-4">Similar jobs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedJobs.map((rj) => (
                <JobCard
                  key={rj.id}
                  id={rj.id}
                  companyId={rj.hideCompanyInfo ? undefined : rj.companyId}
                  title={rj.title}
                  companyName={rj.hideCompanyInfo ? null : rj.company.companyName}
                  logoUrl={rj.hideCompanyInfo ? null : rj.company.logoUrl}
                  location={rj.location}
                  workType={rj.workType}
                  payRangeFrom={rj.payRangeFrom}
                  payRangeTo={rj.payRangeTo}
                  sellingPoint1={rj.sellingPoint1}
                  sellingPoint2={rj.sellingPoint2}
                  sellingPoint3={rj.sellingPoint3}
                  isHot={rj.isHot}
                />
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Sticky apply bar — mobile only, hidden on lg+ */}
      {session?.user?.role !== "COMPANY" && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-white border-t border-[#F0EEE8] px-4 py-3 shadow-[0_-4px_16px_rgba(28,28,30,0.08)]">
          {alreadyApplied ? (
            <div className="w-full bg-[#ECFDF5] border border-[#A7F3D0] rounded-[12px] px-4 py-3 text-sm font-bold text-[#047857] text-center">
              ✓ Applied
            </div>
          ) : session?.user?.role === "INTERVIEWEE" ? (
            <ApplyButton jobId={id} jobTitle={job.title} questions={job.questions}
              className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-3.5 rounded-[12px] shadow-[0_6px_15px_rgba(249,115,22,0.3)] transition-colors text-[15px]" />
          ) : (
            <Link href={`/login?callbackUrl=/jobs/${id}`}
              className="block w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-3.5 rounded-[12px] shadow-[0_6px_15px_rgba(249,115,22,0.3)] transition-colors text-[15px] text-center">
              Sign in to Apply
            </Link>
          )}
        </div>
      )}

      <Footer />
    </div>
  )
}

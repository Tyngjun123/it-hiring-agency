import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { updateJobStatus, duplicateJob } from "@/app/actions/company"
import CompanyProfileRequiredModal from "@/components/company-profile-required-modal"

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  ACTIVE: { label: "Active",  dot: "bg-[#10B981]", bg: "bg-[#ECFDF5]", text: "text-[#047857]" },
  PAUSED: { label: "Paused",  dot: "bg-[#F59E0B]", bg: "bg-[#FFFBEB]", text: "text-[#92400E]" },
  DRAFT:  { label: "Draft",   dot: "bg-[#9CA3AF]", bg: "bg-[#F3F4F6]", text: "text-[#6B7280]" },
  CLOSED: { label: "Closed",  dot: "bg-[#EF4444]", bg: "bg-[#FEF2F2]", text: "text-[#DC2626]" },
}

function daysAgo(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  return `${days}d ago`
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

  if (!profile) return <CompanyProfileRequiredModal />

  const activeCount = profile.jobListings.filter((j) => j.status === "ACTIVE").length
  const totalApplicants = profile.jobListings.reduce((sum, j) => sum + j._count.applications, 0)
  const isPro = profile.plan === "PRO"
  const isMax = profile.plan === "MAX"
  const canPost = isMax || activeCount < (isPro ? 30 : 10)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1C1C1E] tracking-tight">My Jobs</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Manage your listings and track applicants</p>
        </div>
        {canPost ? (
          <Link href="/company/jobs/new"
            className="bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold px-4 py-2.5 rounded-[11px] shadow-[0_4px_10px_rgba(249,115,22,0.3)] transition-colors flex items-center gap-1.5 shrink-0">
            <span className="text-base leading-none">+</span> Post a Job
          </Link>
        ) : (
          <Link href="/company/billing"
            className="bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold px-4 py-2.5 rounded-[11px] shadow-[0_4px_10px_rgba(249,115,22,0.3)] transition-colors shrink-0">
            Upgrade to post more
          </Link>
        )}
      </div>

      {/* Stat cards — 1-col on mobile, 3-col on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          {
            label: "Active Jobs",
            value: activeCount,
            sub: isMax ? "unlimited" : isPro ? "of 30 slots" : "of 10 slots",
            orange: true,
          },
          {
            label: "Total Applicants",
            value: totalApplicants,
            sub: "across all listings",
            orange: true,
          },
          {
            label: "Total Listings",
            value: profile.jobListings.length,
            sub: "all time",
            orange: false,
          },
        ].map(({ label, value, sub, orange }) => (
          <div key={label} className="bg-white border border-[#EEEBE3] rounded-2xl p-5 shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
            <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">{label}</p>
            <p className={`text-3xl font-extrabold mt-2 ${orange ? "text-[#F97316]" : "text-[#1C1C1E]"}`}>{value}</p>
            <p className="text-[11px] text-[#9CA3AF] mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {profile.jobListings.length === 0 ? (
        <div className="bg-white border border-[#EEEBE3] rounded-2xl py-20 text-center shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
          <p className="text-[15px] font-bold text-[#1C1C1E]">No jobs posted yet</p>
          <p className="text-sm text-[#9CA3AF] mt-1 mb-5">Post your first job to start receiving applicants</p>
          <Link href="/company/jobs/new"
            className="inline-flex items-center gap-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold px-4 py-2.5 rounded-[11px] shadow-[0_4px_10px_rgba(249,115,22,0.3)] transition-colors">
            <span className="text-base leading-none">+</span> Post a Job
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#EEEBE3] rounded-2xl shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
          {/* Table header — desktop only */}
          <div className="hidden md:grid grid-cols-[1fr_120px_100px_72px_44px] items-center px-5 py-3 bg-[#FBFAF6] border-b border-[#F0EEE8] rounded-t-2xl">
            <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Job Title</span>
            <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Status</span>
            <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Applicants</span>
            <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Posted</span>
            <span />
          </div>

          {profile.jobListings.map((job, idx) => {
            const sc = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.DRAFT
            return (
              <div key={job.id}
                className={`block md:grid md:grid-cols-[1fr_120px_100px_72px_44px] md:items-center px-5 py-4 hover:bg-[#FDFCFA] transition-colors relative ${
                  idx !== profile.jobListings.length - 1 ? "border-b border-[#F4F1EA]" : ""
                }`}>

                {/* Mobile: ··· menu in top-right */}
                <div className="md:hidden absolute top-4 right-4">
                  <details name="job-menu" className="group">
                    <summary className="list-none cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F2EC] transition-colors text-[#C7C3B9] font-bold text-[18px] leading-none select-none">
                      ···
                    </summary>
                    <div className="absolute right-0 top-9 z-20 bg-white border border-[#EAE8E2] rounded-xl shadow-[0_4px_16px_rgba(28,28,30,0.12)] p-1 min-w-[150px]">
                      <Link href={`/company/jobs/${job.id}/applicants`} className="flex items-center text-sm font-semibold text-[#1C1C1E] px-3 py-2 rounded-lg hover:bg-[#F4F2EC] transition-colors">Applicants</Link>
                      <Link href={`/company/jobs/${job.id}/edit`} className="flex items-center text-sm font-semibold text-[#1C1C1E] px-3 py-2 rounded-lg hover:bg-[#F4F2EC] transition-colors">Edit</Link>
                      {job.status === "ACTIVE" && (<form action={async () => { "use server"; await updateJobStatus(job.id, "PAUSED") }}><button type="submit" className="w-full text-left text-sm font-semibold text-[#1C1C1E] px-3 py-2 rounded-lg hover:bg-[#F4F2EC] transition-colors">Pause</button></form>)}
                      {(job.status === "PAUSED" || job.status === "DRAFT") && (<form action={async () => { "use server"; await updateJobStatus(job.id, "ACTIVE") }}><button type="submit" className="w-full text-left text-sm font-semibold text-[#1C1C1E] px-3 py-2 rounded-lg hover:bg-[#F4F2EC] transition-colors">Activate</button></form>)}
                      <form action={async () => { "use server"; await duplicateJob(job.id) }}><button type="submit" className="w-full text-left text-sm font-semibold text-[#1C1C1E] px-3 py-2 rounded-lg hover:bg-[#F4F2EC] transition-colors">Duplicate</button></form>
                      {job.status === "ACTIVE" && (<Link href={`/company/jobs/${job.id}/boost`} className="flex items-center text-sm font-semibold text-[#EA580C] px-3 py-2 rounded-lg hover:bg-[#FFF7ED] transition-colors">Boost ↑</Link>)}
                      {job.status !== "CLOSED" && (<form action={async () => { "use server"; await updateJobStatus(job.id, "CLOSED") }}><button type="submit" className="w-full text-left text-sm font-semibold text-[#DC2626] px-3 py-2 rounded-lg hover:bg-[#FEF2F2] transition-colors">Close</button></form>)}
                    </div>
                  </details>
                </div>

                {/* Title + location */}
                <div className="min-w-0 pr-10 md:pr-4 mb-3 md:mb-0">
                  <Link href={`/company/jobs/${job.id}/edit`}
                    className="text-[14px] font-bold text-[#1C1C1E] hover:text-[#F97316] truncate block transition-colors">
                    {job.title}
                  </Link>
                  <p className="text-[12px] text-[#9CA3AF] truncate mt-0.5">{job.location}</p>
                </div>

                {/* Mobile label/value row */}
                <div className="flex items-center gap-4 md:contents">
                  {/* Status badge */}
                  <div>
                    <span className="md:hidden text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block mb-1">Status</span>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sc.dot}`} />
                      {sc.label}
                    </span>
                  </div>

                  {/* Applicants */}
                  <div>
                    <span className="md:hidden text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block mb-1">Applicants</span>
                    <Link href={`/company/jobs/${job.id}/applicants`}
                      className="text-[14px] font-bold text-[#F97316] hover:underline">
                      {job._count.applications}
                    </Link>
                  </div>

                  {/* Posted */}
                  <div>
                    <span className="md:hidden text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block mb-1">Posted</span>
                    <span className="text-[12px] text-[#9CA3AF]">{daysAgo(job.createdAt)}</span>
                  </div>
                </div>

                {/* Desktop: ··· menu */}
                <div className="hidden md:flex relative justify-end">
                  <details name="job-menu" className="group">
                    <summary className="list-none cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F2EC] transition-colors text-[#C7C3B9] font-bold text-[18px] leading-none select-none">
                      ···
                    </summary>
                    <div className="absolute right-0 top-9 z-20 bg-white border border-[#EAE8E2] rounded-xl shadow-[0_4px_16px_rgba(28,28,30,0.12)] p-1 min-w-[150px]">
                      <Link href={`/company/jobs/${job.id}/applicants`}
                        className="flex items-center text-sm font-semibold text-[#1C1C1E] px-3 py-2 rounded-lg hover:bg-[#F4F2EC] transition-colors">
                        Applicants
                      </Link>
                      <Link href={`/company/jobs/${job.id}/edit`}
                        className="flex items-center text-sm font-semibold text-[#1C1C1E] px-3 py-2 rounded-lg hover:bg-[#F4F2EC] transition-colors">
                        Edit
                      </Link>
                      {job.status === "ACTIVE" && (
                        <form action={async () => { "use server"; await updateJobStatus(job.id, "PAUSED") }}>
                          <button type="submit" className="w-full text-left text-sm font-semibold text-[#1C1C1E] px-3 py-2 rounded-lg hover:bg-[#F4F2EC] transition-colors">
                            Pause
                          </button>
                        </form>
                      )}
                      {(job.status === "PAUSED" || job.status === "DRAFT") && (
                        <form action={async () => { "use server"; await updateJobStatus(job.id, "ACTIVE") }}>
                          <button type="submit" className="w-full text-left text-sm font-semibold text-[#1C1C1E] px-3 py-2 rounded-lg hover:bg-[#F4F2EC] transition-colors">
                            Activate
                          </button>
                        </form>
                      )}
                      <form action={async () => { "use server"; await duplicateJob(job.id) }}>
                        <button type="submit" className="w-full text-left text-sm font-semibold text-[#1C1C1E] px-3 py-2 rounded-lg hover:bg-[#F4F2EC] transition-colors">
                          Duplicate
                        </button>
                      </form>
                      {job.status === "ACTIVE" && (
                        <Link href={`/company/jobs/${job.id}/boost`}
                          className="flex items-center text-sm font-semibold text-[#EA580C] px-3 py-2 rounded-lg hover:bg-[#FFF7ED] transition-colors">
                          Boost ↑
                        </Link>
                      )}
                      {job.status !== "CLOSED" && (
                        <form action={async () => { "use server"; await updateJobStatus(job.id, "CLOSED") }}>
                          <button type="submit" className="w-full text-left text-sm font-semibold text-[#DC2626] px-3 py-2 rounded-lg hover:bg-[#FEF2F2] transition-colors">
                            Close
                          </button>
                        </form>
                      )}
                    </div>
                  </details>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

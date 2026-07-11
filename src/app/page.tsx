import { prisma } from "@/lib/prisma"
import type { BoostType, BoostStatus } from "@/generated/prisma/enums"
import { auth } from "@/auth"
import type { Session } from "next-auth"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import JobCard from "@/components/job-card"
import JobSearch from "@/components/job-search"
import JobFilters from "@/components/job-filters"
import Pagination from "@/components/pagination"
import OnboardingFlow, { type OnboardingStep } from "@/components/onboarding-flow"
import JobSort from "@/components/job-sort"
import { isAdminEmail } from "@/lib/admin"
import { Suspense } from "react"
import { buildPageMetadata, getPageSchema } from "@/lib/seo"
import { RawJsonLd } from "@/components/json-ld"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("home")
}

const PAGE_SIZE = 10

type SearchParams = {
  q?: string
  location?: string
  workType?: string
  page?: string
  sort?: string
}

async function getListings(q?: string, location?: string, workType?: string, page = 1, sort = "newest") {
  const now = new Date()

  const regularOrderBy =
    sort === "pay_high" ? [{ payRangeTo: "desc" as const }]
    : sort === "pay_low" ? [{ payRangeFrom: "asc" as const }]
    : [{ createdAt: "desc" as const }, { priority: "desc" as const }]

  const keywordFilter = q ? {
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { company: { companyName: { contains: q, mode: "insensitive" as const } } },
      { sellingPoint1: { contains: q, mode: "insensitive" as const } },
      { sellingPoint2: { contains: q, mode: "insensitive" as const } },
      { sellingPoint3: { contains: q, mode: "insensitive" as const } },
    ],
  } : {}

  const locationFilter = location
    ? { location: { contains: location, mode: "insensitive" as const } }
    : {}

  const workTypeFilter = workType ? { workType: workType as never } : {}

  const baseWhere = {
    status: "ACTIVE" as const,
    ...keywordFilter,
    ...locationFilter,
    ...workTypeFilter,
  }

  const boostFilter = { boostType: "PINNED_SEARCH" as BoostType, status: "ACTIVE" as BoostStatus, expiresAt: { gt: now } }

  const boostedWhere = {
    ...baseWhere,
    boostAds: { some: boostFilter },
  }

  const regularWhere = {
    ...baseWhere,
    boostAds: { none: boostFilter },
  }

  const boosted = page === 1
    ? await prisma.jobListing.findMany({
        where: boostedWhere,
        include: { company: true },
        orderBy: { createdAt: "desc" },
      })
    : []

  const regularTotal = await prisma.jobListing.count({ where: regularWhere })

  const boostedCount = page === 1 ? boosted.length : 0
  const regularSlotOnPage1 = PAGE_SIZE - boostedCount
  const skip = page === 1
    ? 0
    : regularSlotOnPage1 + (page - 2) * PAGE_SIZE

  const take = page === 1 ? regularSlotOnPage1 : PAGE_SIZE

  const regular = await prisma.jobListing.findMany({
    where: regularWhere,
    include: { company: true },
    orderBy: regularOrderBy,
    skip: Math.max(0, skip),
    take: Math.max(0, take),
  })

  const totalPages = Math.ceil(
    (regularTotal - regularSlotOnPage1) / PAGE_SIZE + 1
  )

  return { boosted, regular, regularTotal, totalPages: Math.max(1, totalPages) }
}

async function getHeroStats() {
  const [roles, seekers, companies] = await Promise.all([
    prisma.jobListing.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "INTERVIEWEE" } }),
    prisma.companyProfile.count(),
  ])
  return { roles, seekers, companies }
}

function formatStat(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k`
  return String(n)
}

async function getBannerAd() {
  const now = new Date()
  return prisma.boostAd.findFirst({
    where: { boostType: "HOMEPAGE_BANNER", status: "ACTIVE", expiresAt: { gt: now } },
    include: { company: true },
    orderBy: { startsAt: "desc" },
  })
}

async function getOnboardingStep(session: Session | null): Promise<{ step: OnboardingStep; isDev: boolean; jobTypes: string[] }> {
  if (!session?.user?.id) return { step: null, isDev: false, jobTypes: [] }
  if (isAdminEmail(session.user.email)) return { step: null, isDev: false, jobTypes: [] }

  // Read role + profile from the DB (not the JWT). Google users set their role
  // *after* sign-in, so the JWT can be stale and wrongly re-trigger the role popup.
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      intervieweeProfile: { include: { jobPreferences: true, techSkills: true } },
    },
  })

  const role = dbUser?.role
  if (!role) return { step: "role", isDev: false, jobTypes: [] }
  if (role !== "INTERVIEWEE") return { step: null, isDev: false, jobTypes: [] }

  const profile = dbUser.intervieweeProfile

  if (!profile || profile.jobPreferences.length === 0) return { step: "preferences", isDev: false, jobTypes: [] }

  const jobTypes = profile.jobPreferences.map(p => p.jobType)
  const isDev = jobTypes.some(jt =>
    ["BACKEND_DEVELOPER", "FRONTEND_DEVELOPER", "FULLSTACK_DEVELOPER"].includes(jt)
  )

  // Skills step now shows for ALL job seekers (categories filtered to their roles),
  // but only while still onboarding — don't re-prompt people who already finished.
  if (!profile.onboardedAt && profile.techSkills.length === 0 && !profile.skillsPrompted) {
    return { step: "skills", isDev, jobTypes }
  }
  // Resume is optional — onboarding is complete once they've uploaded OR explicitly finished/skipped.
  if (!profile.resumeUrl && !profile.onboardedAt) return { step: "resume", isDev, jobTypes }

  return { step: null, isDev, jobTypes }
}

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q, location, workType, page: pageStr, sort } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)

  const session = await auth()

  const [listingsResult, banner, heroStats] = await Promise.all([
    getListings(q, location, workType, page, sort).catch(() => null),
    getBannerAd().catch(() => null),
    getHeroStats().catch(() => ({ roles: 0, seekers: 0, companies: 0 })),
  ])

  // DB unreachable — let error.tsx show the maintenance page
  if (!listingsResult) throw new Error("Can't reach database server")

  const { boosted, regular, regularTotal, totalPages } = listingsResult

  // Saved-job bookmarks for the current seeker (to show filled/empty on each card)
  const canSave = session?.user?.role === "INTERVIEWEE"
  let savedJobIds = new Set<string>()
  if (canSave && session?.user?.id) {
    const saved = await prisma.savedJob.findMany({
      where: { interviewee: { userId: session.user.id } },
      select: { jobId: true },
    }).catch(() => [])
    savedJobIds = new Set(saved.map((s) => s.jobId))
  }

  const { step: onboardingStep, jobTypes } = await getOnboardingStep(session)

  const total = (page === 1 ? boosted.length : 0) + regularTotal
  const isFiltered = !!(q || location || workType)

  const homeSchema = await getPageSchema("home")

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <RawJsonLd json={homeSchema} />
      <OnboardingFlow step={onboardingStep} jobTypes={jobTypes} />
      <Navbar />

      {/* Hero */}
      <div style={{ background: "linear-gradient(180deg, #FFF7ED 0%, #FFFBF5 100%)" }}
        className="border-b border-[#F2EBDF]">
        <div className="max-w-4xl mx-auto px-4 py-5 md:py-9 space-y-4">
          <div className="text-center space-y-2.5">
            <div className="inline-flex items-center gap-2 bg-white border border-[#FBDDBE] px-3 py-1.5 rounded-full text-xs font-semibold text-[#C2410C]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] inline-block" />
              Tech jobs in Malaysia · Find yours today
            </div>
            <h1 className="text-[27px] md:text-4xl lg:text-5xl font-extrabold text-[#1C1C1E] tracking-tight leading-[1.06]">
              Find your next role <span className="text-[#F97316]">in tech</span>
            </h1>
            <p className="text-[#6B7280] text-[14px] md:text-base max-w-md mx-auto leading-relaxed">
              The job board built only for Malaysian IT professionals. No recruiter spam, no fluff.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-7 md:gap-10 pt-1">
              {[
                { value: formatStat(heroStats.roles), label: heroStats.roles === 1 ? "role" : "roles" },
                { value: formatStat(heroStats.seekers), label: heroStats.seekers === 1 ? "seeker" : "seekers" },
                { value: formatStat(heroStats.companies), label: heroStats.companies === 1 ? "company" : "companies" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-[17px] md:text-[19px] font-extrabold text-[#1C1C1E] leading-none">{s.value}</p>
                  <p className="text-[11.5px] text-[#9CA3AF] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <Suspense>
            <JobSearch />
          </Suspense>
          <Suspense>
            <JobFilters />
          </Suspense>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 space-y-4">

        {/* Banner ad */}
        {banner && page === 1 && (
          <div className="bg-white border border-[#FBDDBE] rounded-2xl p-4 md:p-5 flex items-center justify-between gap-3 shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
            <div>
              <p className="text-xs text-[#C2410C] font-semibold mb-1">Sponsored</p>
              <p className="font-bold text-[#1C1C1E]">{banner.company.companyName} is hiring</p>
              {banner.company.description && (
                <p className="text-sm text-[#6B7280] mt-0.5">{banner.company.description}</p>
              )}
            </div>
            <a href={`/companies/${banner.company.id}`}
              className="shrink-0 text-sm font-bold text-[#F97316] border border-[#F97316] px-4 py-2 rounded-[11px] hover:bg-[#FFF7ED] transition-colors">
              View jobs
            </a>
          </div>
        )}

        {/* Result count + sort */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[#6B7280] min-w-0">
            <span className="font-bold text-[#F97316]">{total}</span>{" "}
            {isFiltered ? `result${total !== 1 ? "s" : ""}` : `job${total !== 1 ? "s" : ""} available`}
            {q && <> for &ldquo;{q}&rdquo;</>}
            {location && <> in {location}</>}
            {workType && <> · {workType === "REMOTE" ? "Remote" : workType === "HYBRID" ? "Hybrid" : "On-site"}</>}
          </p>
          <div className="flex items-center gap-3 shrink-0">
            {isFiltered && (
              <a href="/" className="text-sm text-[#F97316] hover:underline font-semibold">Clear all</a>
            )}
            <Suspense>
              <JobSort />
            </Suspense>
          </div>
        </div>

        {/* Jobs */}
        {total === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-bold text-[#1C1C1E]">{isFiltered ? "No jobs match your search" : "No jobs posted yet"}</p>
            <p className="text-sm mt-1 text-[#9CA3AF]">{isFiltered ? "Try different keywords or filters" : "Check back soon"}</p>
            {isFiltered && <a href="/" className="mt-3 inline-block text-sm text-[#F97316] font-semibold hover:underline">Browse all jobs</a>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boosted.map((job) => (
              <JobCard key={job.id} id={job.id} companyId={job.company.id} title={job.title}
                companyName={job.hideCompanyInfo ? null : job.company.companyName}
                logoUrl={job.hideCompanyInfo ? null : job.company.logoUrl}
                location={job.location} workType={job.workType}
                payRangeFrom={job.payRangeFrom} payRangeTo={job.payRangeTo}
                sellingPoint1={job.sellingPoint1} sellingPoint2={job.sellingPoint2}
                sellingPoint3={job.sellingPoint3} isBoosted
                canSave={canSave} initialSaved={savedJobIds.has(job.id)} />
            ))}
            {regular.map((job) => (
              <JobCard key={job.id} id={job.id} companyId={job.company.id} title={job.title}
                companyName={job.hideCompanyInfo ? null : job.company.companyName}
                logoUrl={job.hideCompanyInfo ? null : job.company.logoUrl}
                location={job.location} workType={job.workType}
                payRangeFrom={job.payRangeFrom} payRangeTo={job.payRangeTo}
                sellingPoint1={job.sellingPoint1} sellingPoint2={job.sellingPoint2}
                sellingPoint3={job.sellingPoint3} isHot={job.isHot}
                canSave={canSave} initialSaved={savedJobIds.has(job.id)} />
            ))}
          </div>
        )}

        <Suspense>
          <Pagination page={page} totalPages={totalPages} />
        </Suspense>

      </main>
      <Footer />
    </div>
  )
}

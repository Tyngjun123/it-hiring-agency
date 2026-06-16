import { prisma } from "@/lib/prisma"
import type { BoostType, BoostStatus } from "@/generated/prisma/enums"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import JobCard from "@/components/job-card"
import JobSearch from "@/components/job-search"
import JobFilters from "@/components/job-filters"
import Pagination from "@/components/pagination"
import { Suspense } from "react"

const PAGE_SIZE = 10

type SearchParams = {
  q?: string
  location?: string
  workType?: string
  page?: string
}

async function getListings(q?: string, location?: string, workType?: string, page = 1) {
  const now = new Date()

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
    orderBy: { createdAt: "desc" },
    skip: Math.max(0, skip),
    take: Math.max(0, take),
  })

  const totalPages = Math.ceil(
    (regularTotal - regularSlotOnPage1) / PAGE_SIZE + 1
  )

  return { boosted, regular, regularTotal, totalPages: Math.max(1, totalPages) }
}

async function getBannerAd() {
  const now = new Date()
  return prisma.boostAd.findFirst({
    where: { boostType: "HOMEPAGE_BANNER", status: "ACTIVE", expiresAt: { gt: now } },
    include: { company: true },
    orderBy: { startsAt: "desc" },
  })
}

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q, location, workType, page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)

  const [{ boosted, regular, regularTotal, totalPages }, banner] = await Promise.all([
    getListings(q, location, workType, page),
    getBannerAd(),
  ])

  const total = (page === 1 ? boosted.length : 0) + regularTotal
  const isFiltered = !!(q || location || workType)

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <Navbar />

      {/* Hero */}
      <div style={{ background: "linear-gradient(180deg, #FFF7ED 0%, #FFFBF5 100%)" }}
        className="border-b border-[#F2EBDF]">
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-5">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-white border border-[#FBDDBE] px-3 py-1.5 rounded-full text-xs font-semibold text-[#C2410C]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] inline-block" />
              Tech jobs in Malaysia · Find yours today
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1C1C1E] tracking-tight leading-[1.06]">
              Find your next role <span className="text-[#F97316]">in tech</span>
            </h1>
            <p className="text-[#6B7280] text-base max-w-md mx-auto leading-relaxed">
              The job board built only for Malaysian IT professionals. No recruiter spam, no fluff.
            </p>
          </div>
          <Suspense>
            <JobSearch />
          </Suspense>
          <Suspense>
            <JobFilters />
          </Suspense>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-5">

        {/* Banner ad */}
        {banner && page === 1 && (
          <div className="bg-white border border-[#FBDDBE] rounded-2xl p-5 flex items-center justify-between gap-4 shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
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

        {/* Result count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#6B7280]">
            <span className="font-bold text-[#F97316]">{total}</span>{" "}
            {isFiltered ? `result${total !== 1 ? "s" : ""}` : `job${total !== 1 ? "s" : ""} available`}
            {q && <> for &ldquo;{q}&rdquo;</>}
            {location && <> in {location}</>}
            {workType && <> · {workType === "REMOTE" ? "Remote" : workType === "HYBRID" ? "Hybrid" : "On-site"}</>}
          </p>
          {isFiltered && (
            <a href="/" className="text-sm text-[#F97316] hover:underline font-semibold">Clear all</a>
          )}
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
                location={job.location} workType={job.workType}
                payRangeFrom={job.payRangeFrom} payRangeTo={job.payRangeTo}
                sellingPoint1={job.sellingPoint1} sellingPoint2={job.sellingPoint2}
                sellingPoint3={job.sellingPoint3} isBoosted />
            ))}
            {regular.map((job) => (
              <JobCard key={job.id} id={job.id} companyId={job.company.id} title={job.title}
                companyName={job.hideCompanyInfo ? null : job.company.companyName}
                location={job.location} workType={job.workType}
                payRangeFrom={job.payRangeFrom} payRangeTo={job.payRangeTo}
                sellingPoint1={job.sellingPoint1} sellingPoint2={job.sellingPoint2}
                sellingPoint3={job.sellingPoint3} />
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

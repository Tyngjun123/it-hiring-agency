export const revalidate = 60

import { prisma } from "@/lib/prisma"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"

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

export default async function CompaniesPage() {
  const companies = await prisma.companyProfile.findMany({
    include: {
      _count: {
        select: { jobListings: { where: { status: "ACTIVE" } } },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-[#F0EEE8]">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-extrabold text-[#1C1C1E] tracking-tight">Companies hiring in IT</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            <span className="text-[#F97316] font-bold">{companies.length}</span> companies on StackTalentx
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {companies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-bold text-[#1C1C1E]">No companies yet</p>
            <p className="text-sm text-[#9CA3AF] mt-1">Check back soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companies.map((company) => {
              const av = avatarFor(company.companyName)
              const activeJobs = company._count.jobListings
              return (
                <Link key={company.id} href={`/companies/${company.id}`}
                  className="bg-white border border-[#EEEBE3] rounded-2xl p-5 shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)] hover:shadow-[0_2px_4px_rgba(28,28,30,0.05),0_14px_34px_rgba(28,28,30,0.09)] transition-shadow flex items-start gap-4">

                  {/* Logo avatar */}
                  <div className="w-14 h-14 rounded-[15px] flex items-center justify-center font-extrabold text-2xl shrink-0"
                    style={{ background: av.bg, color: av.fg }}>
                    {company.companyName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-bold text-[#1C1C1E] leading-snug">{company.companyName}</p>
                    {company.website && (
                      <p className="text-xs text-[#9CA3AF] mt-0.5 truncate">{company.website.replace(/^https?:\/\//, "")}</p>
                    )}
                    {company.description && (
                      <p className="text-sm text-[#6B7280] mt-1.5 line-clamp-2 leading-relaxed">{company.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs font-bold text-[#F97316]">
                        {activeJobs} open role{activeJobs !== 1 ? "s" : ""}
                      </span>
                      {company.contactEmail && (
                        <span className="text-xs text-[#9CA3AF]">·</span>
                      )}
                      <span className="text-xs font-semibold text-[#F97316]">View company →</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

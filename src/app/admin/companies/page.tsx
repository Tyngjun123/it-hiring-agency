export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import Navbar from "@/components/navbar"
import Link from "next/link"
import CompanyPlanEditor from "@/components/admin/company-plan-editor"

const PLAN_BADGE: Record<string, string> = {
  FREE: "bg-[#F4F1EA] text-[#9CA3AF]",
  PRO: "bg-[#EFF6FF] text-[#1D4ED8]",
  MAX: "bg-[#FFF7ED] text-[#F97316] border border-[#FBDDBE]",
}

function toDateInput(d: Date | null): string | null {
  if (!d) return null
  return new Date(d).toISOString().slice(0, 10) // YYYY-MM-DD
}

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const { saved, error } = await searchParams

  const companies = await prisma.companyProfile.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      companyName: true,
      contactEmail: true,
      plan: true,
      planExpiresAt: true,
      _count: { select: { jobListings: true } },
    },
  })

  const now = new Date()

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        <div>
          <Link href="/admin" className="text-sm font-bold text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
            ← Admin panel
          </Link>
          <h1 className="text-[22px] font-extrabold text-[#1C1C1E] tracking-tight mt-2">Company Plans</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">
            {companies.length} companies — set plan, expiry date, or mark as forever
          </p>
        </div>

        {saved === "1" && (
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl px-4 py-3 text-sm font-semibold text-[#047857]">
            Plan updated.
          </div>
        )}
        {error === "1" && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl px-4 py-3 text-sm font-semibold text-[#DC2626]">
            Could not update plan. Check the inputs.
          </div>
        )}

        <div className="bg-[#FFF7ED] border border-[#FBDDBE] rounded-xl px-4 py-3 text-sm text-[#92400E]">
          <strong>Forever</strong> = no expiry (plan never lapses). For a time-limited plan, untick Forever and pick an <strong>Expires on</strong> date. <strong>Free</strong> plans never have an expiry.
        </div>

        <div className="space-y-3">
          {companies.length === 0 ? (
            <div className="bg-white border border-[#EEEBE3] rounded-2xl py-16 text-center text-sm text-[#9CA3AF]">
              No companies yet
            </div>
          ) : (
            companies.map((c) => {
              const expiry = toDateInput(c.planExpiresAt)
              const isExpired = c.planExpiresAt && c.planExpiresAt < now && c.plan !== "FREE"
              return (
                <div key={c.id} className="bg-white border border-[#EEEBE3] rounded-2xl p-5 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)]">
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[15px] font-bold text-[#1C1C1E] truncate">{c.companyName}</p>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${PLAN_BADGE[c.plan]}`}>
                          {c.plan}
                        </span>
                        {isExpired && (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626]">
                            Expired
                          </span>
                        )}
                      </div>
                      <p className="text-[12.5px] text-[#9CA3AF] mt-0.5 truncate">
                        {c.contactEmail} · {c._count.jobListings} job{c._count.jobListings !== 1 ? "s" : ""}
                        {c.plan !== "FREE" && (
                          <> · {c.planExpiresAt
                            ? `expires ${new Date(c.planExpiresAt).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}`
                            : "forever"}</>
                        )}
                      </p>
                    </div>
                  </div>

                  <CompanyPlanEditor
                    companyId={c.id}
                    currentPlan={c.plan}
                    currentExpiry={expiry}
                  />
                </div>
              )
            })
          )}
        </div>

      </main>
    </div>
  )
}

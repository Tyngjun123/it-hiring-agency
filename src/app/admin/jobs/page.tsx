export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import Navbar from "@/components/navbar"
import Link from "next/link"
import BulkJobTable from "@/components/admin/bulk-job-table"

export default async function AdminJobsPage() {
  const jobs = await prisma.jobListing.findMany({
    include: { company: { select: { companyName: true } } },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  })

  const activeCount = jobs.filter((j) => j.status === "ACTIVE").length

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        <div>
          <Link href="/admin" className="text-sm font-bold text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
            ← Admin panel
          </Link>
          <h1 className="text-[22px] font-extrabold text-[#1C1C1E] tracking-tight mt-2">Job Moderation</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">
            {activeCount} active listings — toggle Hot, adjust priority, or bulk-update status
          </p>
        </div>

        <div className="bg-[#FFF7ED] border border-[#FBDDBE] rounded-xl px-4 py-3 text-sm text-[#92400E]">
          <strong>Hot</strong> highlights with a fire badge. Higher <strong>Priority</strong> = shown first on homepage.
          Select jobs with checkboxes to bulk-activate, pause, or close them.
        </div>

        <BulkJobTable jobs={jobs} />

      </main>
    </div>
  )
}

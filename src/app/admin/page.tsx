export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import Navbar from "@/components/navbar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { approvePayment, rejectPayment } from "@/app/actions/admin"

const APP_STATUS_COLOR: Record<string, string> = {
  PENDING: "text-yellow-600",
  SUCCESS: "text-green-600",
  FAIL: "text-red-500",
}

const PLAN_COLOR: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600",
  PRO: "bg-blue-100 text-blue-700",
  MAX: "bg-orange-100 text-orange-700",
}

export default async function AdminPage() {
  const pendingPayments = await prisma.payment.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: { company: { select: { companyName: true, contactEmail: true } } },
  })

  const [
    userCount,
    companyCount,
    jobCount,
    applicationCount,
    recentUsers,
    recentJobs,
    recentApplications,
    companies,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.companyProfile.count(),
    prisma.jobListing.count(),
    prisma.application.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.jobListing.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { company: { select: { companyName: true } } },
    }),
    prisma.application.findMany({
      orderBy: { appliedAt: "desc" },
      take: 10,
      include: {
        jobListing: { select: { title: true } },
        interviewee: { include: { user: { select: { name: true, email: true } } } },
      },
    }),
    prisma.companyProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true, companyName: true, contactEmail: true, plan: true,
        createdAt: true, _count: { select: { jobListings: true } },
      },
    }),
  ])

  const activeJobs = await prisma.jobListing.count({ where: { status: "ACTIVE" } })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500 mt-0.5">Platform overview</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/admin/blog"
              className="bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold px-4 py-2 rounded-[11px] shadow-[0_4px_10px_rgba(249,115,22,0.3)] transition-colors">
              Blog CMS
            </Link>
            <Link href="/admin/jobs"
              className="border border-[#F97316] text-[#F97316] hover:bg-[#FFF7ED] text-sm font-bold px-4 py-2 rounded-[11px] transition-colors">
              Job Moderation
            </Link>
            <Link href="/admin/companies"
              className="border border-[#E6E2D9] text-[#4B5563] hover:border-[#F97316] hover:text-[#F97316] text-sm font-bold px-4 py-2 rounded-[11px] transition-colors">
              Company Plans
            </Link>
            <Link href="/admin/cms"
              className="border border-[#E6E2D9] text-[#4B5563] hover:border-[#F97316] hover:text-[#F97316] text-sm font-bold px-4 py-2 rounded-[11px] transition-colors">
              Content CMS
            </Link>
            <Link href="/admin/emails"
              className="border border-[#E6E2D9] text-[#4B5563] hover:border-[#F97316] hover:text-[#F97316] text-sm font-bold px-4 py-2 rounded-[11px] transition-colors">
              Email Content
            </Link>
            <Link href="/admin/settings"
              className="border border-[#E6E2D9] text-[#4B5563] hover:border-[#F97316] hover:text-[#F97316] text-sm font-bold px-4 py-2 rounded-[11px] transition-colors">
              Site Settings
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Users", value: userCount },
            { label: "Companies", value: companyCount },
            { label: "Jobs Posted", value: jobCount },
            { label: "Active Jobs", value: activeJobs },
            { label: "Applications", value: applicationCount },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent users */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-3">
            <h2 className="font-semibold text-gray-900">Recent Users</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-2 font-medium">User</th>
                  <th className="text-left pb-2 font-medium">Role</th>
                  <th className="text-left pb-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="py-2 pr-3">
                      <p className="font-medium text-gray-900 truncate max-w-[140px]">{u.name ?? "—"}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[140px]">{u.email}</p>
                    </td>
                    <td className="py-2 pr-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "COMPANY" ? "bg-blue-50 text-blue-700" : u.role === "INTERVIEWEE" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {u.role ?? "pending"}
                      </span>
                    </td>
                    <td className="py-2 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Companies */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-3">
            <h2 className="font-semibold text-gray-900">Companies</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-2 font-medium">Company</th>
                  <th className="text-left pb-2 font-medium">Plan</th>
                  <th className="text-left pb-2 font-medium">Jobs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {companies.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2 pr-3">
                      <p className="font-medium text-gray-900 truncate max-w-[140px]">{c.companyName}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[140px]">{c.contactEmail}</p>
                    </td>
                    <td className="py-2 pr-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_COLOR[c.plan]}`}>
                        {c.plan}
                      </span>
                    </td>
                    <td className="py-2 text-xs text-gray-500">{c._count.jobListings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent jobs */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">Recent Job Postings</h2>
          <div className="space-y-2">
            {recentJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <Link href={`/jobs/${job.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                    {job.title}
                  </Link>
                  <p className="text-xs text-gray-400">{job.company.companyName} · {job.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    job.status === "ACTIVE" ? "bg-green-50 text-green-700" :
                    job.status === "PAUSED" ? "bg-yellow-50 text-yellow-600" :
                    job.status === "CLOSED" ? "bg-red-50 text-red-500" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {job.status}
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(job.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending payments */}
        {pendingPayments.length > 0 && (
          <div className="bg-white border border-amber-200 rounded-xl p-5 space-y-3">
            <h2 className="font-semibold text-gray-900">
              Pending Payments
              <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">{pendingPayments.length}</span>
            </h2>
            <div className="space-y-3">
              {pendingPayments.map((p) => {
                const isBoost = p.type === "BOOST_AD" && p.billplzRef
                const boostInfo = isBoost ? p.billplzRef!.split("|") : null

                return (
                  <div key={p.id} className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {p.type === "SUBSCRIPTION" ? "Pro Upgrade" : "Boost Ad"}
                        {" — "}{p.company.companyName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {p.company.contactEmail}
                        {boostInfo && ` · ${boostInfo[2] === "PINNED_SEARCH" ? "Search Pin" : "Homepage Banner"}`}
                        {" · "}RM {Number(p.amount).toLocaleString()}
                        {" · "}{new Date(p.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <form action={async () => { "use server"; await approvePayment(p.id) }}>
                        <Button size="sm" type="submit" className="bg-green-600 hover:bg-green-700">Approve</Button>
                      </form>
                      <form action={async () => { "use server"; await rejectPayment(p.id) }}>
                        <Button size="sm" variant="outline" type="submit" className="text-red-500">Reject</Button>
                      </form>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent applications */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">Recent Applications</h2>
          <div className="space-y-2">
            {recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {app.interviewee.user.name ?? app.interviewee.user.email}
                  </p>
                  <p className="text-xs text-gray-400">→ {app.jobListing.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium ${APP_STATUS_COLOR[app.status]}`}>
                    {app.status}
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(app.appliedAt).toLocaleDateString("en-MY", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}

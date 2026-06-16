import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import CompanySidebarNav from "@/components/company-sidebar-nav"

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "COMPANY") redirect("/")

  const profile = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id! },
    select: {
      plan: true,
      _count: { select: { jobListings: { where: { status: "ACTIVE" } } } },
    },
  })

  const activeJobs = profile?._count.jobListings ?? 0
  const isPro = profile?.plan === "PRO"

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex">

      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 bg-[#FBFAF6] border-r border-[#F0EEE8] min-h-screen sticky top-0 flex flex-col overflow-y-auto">

        {/* Logo */}
        <div className="p-5 pb-4 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[9px] bg-[#F97316] flex items-center justify-center shadow-[0_4px_11px_rgba(249,115,22,0.35)]">
              <span className="text-white font-mono font-bold text-sm leading-none">&gt;_</span>
            </div>
            <span className="text-[17px] font-extrabold text-[#1C1C1E] tracking-tight">IT Hire</span>
          </Link>
        </div>

        <CompanySidebarNav />

        {/* Plan card */}
        <div className="mx-3 mt-4 shrink-0">
          <div className="bg-[#FFF7ED] border border-[#FBDDBE] rounded-xl p-4">
            <p className="text-[13px] font-bold text-[#1C1C1E]">{isPro ? "Pro plan" : "Free plan"}</p>
            {!isPro && (
              <>
                <p className="text-[11px] text-[#9CA3AF] mt-1">{activeJobs} of 10 slots used</p>
                <div className="h-1.5 bg-[#FCE4CB] rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-[#F97316] rounded-full transition-all"
                    style={{ width: `${Math.min(100, (activeJobs / 10) * 100)}%` }} />
                </div>
                <Link href="/company/billing"
                  className="mt-2.5 block text-center text-[11px] font-bold text-[#C2410C] hover:text-[#9A3412] transition-colors">
                  Upgrade to Pro →
                </Link>
              </>
            )}
            {isPro && <p className="text-[11px] text-[#9CA3AF] mt-1">Unlimited listings</p>}
          </div>
        </div>

        {/* User info + sign out */}
        <div className="mt-auto p-4 border-t border-[#F0EEE8] shrink-0">
          <p className="text-[11px] text-[#9CA3AF] truncate mb-1.5">{session.user.name ?? session.user.email}</p>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }) }}>
            <button type="submit"
              className="text-xs font-semibold text-[#6B7280] hover:text-[#1C1C1E] transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-8">{children}</main>
    </div>
  )
}

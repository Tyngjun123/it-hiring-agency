export const dynamic = "force-dynamic"

import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import CompanySidebarNav from "@/components/company-sidebar-nav"
import CompanyBottomNav from "@/components/company-bottom-nav"
import NotificationBell from "@/components/notification-bell"
import { LogoTile, Wordmark } from "@/components/brand"

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  // Check role from DB — JWT may be stale right after role selection
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      companyProfile: {
        select: {
          plan: true,
          _count: { select: { jobListings: { where: { status: "ACTIVE" } } } },
        },
      },
    },
  })
  if (!user || user.role !== "COMPANY") redirect("/")

  const profile = user.companyProfile

  const activeJobs = profile?._count.jobListings ?? 0
  const isPro = profile?.plan === "PRO"
  const isMax = profile?.plan === "MAX"

  // 🔔 notifications for the company user (fail-safe — never blocks the portal)
  let notifUnread = 0
  let notifItems: { id: string; type: string; title: string; body: string; link: string; read: boolean; createdAt: string }[] = []
  try {
    const [unread, recent] = await Promise.all([
      prisma.notification.count({ where: { userId: session.user.id, read: false } }),
      prisma.notification.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 8 }),
    ])
    notifUnread = unread
    notifItems = recent.map((n) => ({
      id: n.id, type: n.type, title: n.title, body: n.body,
      link: n.link, read: n.read, createdAt: n.createdAt.toISOString(),
    }))
  } catch {
    // non-critical
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex">

      {/* Sidebar — hidden on mobile, shown on desktop */}
      <aside className="hidden lg:flex w-[220px] shrink-0 bg-[#FBFAF6] border-r border-[#F0EEE8] min-h-screen sticky top-0 flex-col overflow-y-auto">

        {/* Logo */}
        <div className="p-5 pb-4 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <LogoTile size={32} variant="onDark" />
            <Wordmark className="text-[17px] font-extrabold text-[#1C1C1E] tracking-tight" />
          </Link>
        </div>

        <CompanySidebarNav />

        {/* Plan card */}
        <div className="mx-3 mt-4 shrink-0">
          <div className="bg-[#FFF7ED] border border-[#FBDDBE] rounded-xl p-4">
            <p className="text-[13px] font-bold text-[#1C1C1E]">{isMax ? "Max plan" : isPro ? "Pro plan" : "Free plan"}</p>
            {isMax ? (
              <p className="text-[11px] text-[#9CA3AF] mt-1">{activeJobs} active · unlimited listings</p>
            ) : (
              <>
                <p className="text-[11px] text-[#9CA3AF] mt-1">{activeJobs} of {isPro ? 30 : 10} slots used</p>
                <div className="h-1.5 bg-[#FCE4CB] rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-[#F97316] rounded-full transition-all"
                    style={{ width: `${Math.min(100, (activeJobs / (isPro ? 30 : 10)) * 100)}%` }} />
                </div>
                {!isPro && (
                  <Link href="/company/billing"
                    className="mt-2.5 block text-center text-[11px] font-bold text-[#C2410C] hover:text-[#9A3412] transition-colors">
                    Upgrade to Pro →
                  </Link>
                )}
              </>
            )}
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
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <div className="bg-white border-b border-[#F0EEE8] px-4 lg:px-8 py-3 flex items-center justify-between shrink-0">
          <Link href="/"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-[#6B7280] hover:text-[#F97316] transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"/>
            </svg>
            Back to site
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank"
              className="hidden sm:flex text-[12.5px] font-semibold text-[#9CA3AF] hover:text-[#F97316] transition-colors items-center gap-1">
              View live site
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6m0 0v6m0-6L10 14"/>
              </svg>
            </Link>
            <NotificationBell initialUnread={notifUnread} items={notifItems} />
          </div>
        </div>
        {/* Add bottom padding on mobile so content isn't hidden behind the tab bar */}
        <main className="flex-1 min-w-0 p-4 lg:p-8 pb-20 lg:pb-8">{children}</main>
      </div>

      {/* Mobile bottom tab bar — hidden on desktop */}
      <CompanyBottomNav />
    </div>
  )
}

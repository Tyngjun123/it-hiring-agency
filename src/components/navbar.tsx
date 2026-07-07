import Link from "next/link"
import { auth } from "@/auth"
import { signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getSiteConfig } from "@/lib/site-config"
import { isAdminEmail } from "@/lib/admin"
import MobileNav from "@/components/mobile-nav"
import SignInButton from "@/components/auth/sign-in-button"
import SignUpButton from "@/components/auth/sign-up-button"
import PostJobButton from "@/components/auth/post-job-button"
import NotificationBell from "@/components/notification-bell"
import { LogoTile, Wordmark, BRAND_NAME } from "@/components/brand"

function Logo({ logoUrl }: { logoUrl?: string | null }) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoUrl} alt={BRAND_NAME} className="h-8 w-auto object-contain shrink-0" />
    )
  }
  return (
    <div className="flex items-center gap-2 shrink-0">
      <LogoTile size={32} variant="onDark" />
      <Wordmark className="text-[19px] font-extrabold text-[#1C1C1E] tracking-tight leading-none whitespace-nowrap" />
    </div>
  )
}

const NAV_LINK = "text-sm font-semibold text-[#6B7280] hover:text-[#1C1C1E] hover:bg-[#FAFAF8] px-3 py-1.5 rounded-lg transition-colors"

export default async function Navbar() {
  const [session, siteConfig] = await Promise.all([auth(), getSiteConfig()])
  const isAdmin = isAdminEmail(session?.user?.email)
  const role = session?.user?.role

  // For company users, get their public profile ID so username links to their profile page
  let companyProfileId: string | null = null
  if (role === "COMPANY" && session?.user?.id) {
    const cp = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    companyProfileId = cp?.id ?? null
  }

  const displayName = session?.user?.name ?? session?.user?.email ?? ""

  // 🔔 notifications — recent + unread count for the signed-in user (fail-safe).
  let notifUnread = 0
  let notifItems: { id: string; type: string; title: string; body: string; link: string; read: boolean; createdAt: string }[] = []
  if (session?.user?.id) {
    try {
      const [unread, recent] = await Promise.all([
        prisma.notification.count({ where: { userId: session.user.id, read: false } }),
        prisma.notification.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
      ])
      notifUnread = unread
      notifItems = recent.map((n) => ({
        id: n.id, type: n.type, title: n.title, body: n.body,
        link: n.link, read: n.read, createdAt: n.createdAt.toISOString(),
      }))
    } catch {
      // notifications are non-critical — never block the navbar
    }
  }

  return (
    <header className="bg-white border-b border-[#F0EEE8] sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-6">

        <Link href="/"><Logo logoUrl={siteConfig?.logoUrl} /></Link>

        {/* Nav links — desktop only */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1">
          <Link href="/" className="text-sm font-semibold text-[#F97316] px-3 py-1.5 rounded-lg">
            Find Jobs
          </Link>
          <Link href="/companies" className={NAV_LINK}>Companies</Link>

          {role === "INTERVIEWEE" && (
            <>
              <Link href="/profile" className={NAV_LINK}>My Profile</Link>
              <Link href="/dashboard" className={NAV_LINK}>Applications</Link>
            </>
          )}

          {role === "COMPANY" && (
            <Link href="/company/billing" className={NAV_LINK}>Billing</Link>
          )}

          <Link href="/about" className={NAV_LINK}>About</Link>
          <Link href="/blog" className={NAV_LINK}>Blog</Link>

          {isAdmin && <Link href="/admin" className={NAV_LINK}>Admin</Link>}
        </nav>

        {/* Auth — hidden on mobile, shown on desktop */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {session?.user ? (
            <>
              <NotificationBell initialUnread={notifUnread} items={notifItems} />

              {/* Username — clickable to company profile if company user */}
              {role === "COMPANY" && companyProfileId ? (
                <Link href={`/companies/${companyProfileId}`}
                  className="text-sm font-semibold text-[#6B7280] hover:text-[#F97316] max-w-[140px] truncate transition-colors">
                  {displayName}
                </Link>
              ) : (
                <span className="text-sm text-[#9CA3AF] max-w-[140px] truncate">
                  {displayName}
                </span>
              )}

              <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }) }}>
                <button type="submit" className="text-sm font-semibold text-[#6B7280] hover:text-[#1C1C1E] transition-colors">
                  Sign out
                </button>
              </form>

              {role === "COMPANY" && (
                <>
                  <Link href="/company/jobs"
                    className="text-sm font-semibold text-[#3A3A3C] hover:text-[#F97316] transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/company/jobs/new"
                    className="bg-[#F97316] text-white text-sm font-bold px-4 py-2 rounded-[11px] shadow-[0_6px_15px_rgba(249,115,22,0.3)] hover:bg-[#EA580C] transition-colors">
                    + Post a Job
                  </Link>
                </>
              )}
            </>
          ) : (
            <>
              <SignInButton className="text-sm font-semibold text-[#3A3A3C] hover:text-[#1C1C1E] transition-colors cursor-pointer" />
              <SignUpButton className="bg-[#F97316] text-white text-sm font-bold px-4 py-2 rounded-[11px] shadow-[0_6px_15px_rgba(249,115,22,0.3)] hover:bg-[#EA580C] transition-colors cursor-pointer" />
              <PostJobButton
                className="border border-[#E6E2D9] text-[#3A3A3C] text-sm font-bold px-4 py-2 rounded-[11px] hover:border-[#F97316] hover:text-[#F97316] transition-colors cursor-pointer">
                Post a Job
              </PostJobButton>
            </>
          )}
        </div>

        {/* Mobile right cluster — bell (left) + hamburger. Hidden on desktop. */}
        <div className="lg:hidden flex items-center gap-1 shrink-0">
          {session?.user && (
            <Link href="/notifications" aria-label="Notifications"
              className="relative w-11 h-11 rounded-[10px] flex items-center justify-center hover:bg-[#F4F2EC] transition-colors text-[#3A3A3C]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {notifUnread > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#F97316] text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white">
                  {notifUnread > 9 ? "9+" : notifUnread}
                </span>
              )}
            </Link>
          )}
          <MobileNav
            role={role}
            isAdmin={isAdmin}
            displayName={displayName}
            companyProfileId={companyProfileId}
            isSignedIn={!!session?.user}
            notifUnread={notifUnread}
          />
        </div>
      </div>
    </header>
  )
}

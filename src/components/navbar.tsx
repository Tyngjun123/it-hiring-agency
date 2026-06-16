import Link from "next/link"
import { auth } from "@/auth"
import { signOut } from "@/auth"

const ADMIN_EMAILS = ["tyngjun123@gmail.com"]

function Logo() {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="w-8 h-8 rounded-[9px] bg-[#F97316] flex items-center justify-center shadow-[0_4px_11px_rgba(249,115,22,0.35)]">
        <span className="text-white font-mono font-bold text-sm leading-none">&gt;_</span>
      </div>
      <span className="text-[19px] font-extrabold text-[#1C1C1E] tracking-tight leading-none whitespace-nowrap">IT Hire</span>
    </div>
  )
}

export default async function Navbar() {
  const session = await auth()
  const isAdmin = session?.user?.email ? ADMIN_EMAILS.includes(session.user.email) : false
  const role = session?.user?.role

  return (
    <header className="bg-white border-b border-[#F0EEE8] sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-6">

        <Link href="/"><Logo /></Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          <Link href="/"
            className="text-sm font-semibold text-[#F97316] px-3 py-1.5 rounded-lg">
            Find Jobs
          </Link>
          <Link href="/companies"
            className="text-sm font-semibold text-[#6B7280] hover:text-[#1C1C1E] hover:bg-[#FAFAF8] px-3 py-1.5 rounded-lg transition-colors">
            Companies
          </Link>
          {role === "INTERVIEWEE" && (
            <>
              <Link href="/profile"
                className="text-sm font-semibold text-[#6B7280] hover:text-[#1C1C1E] hover:bg-[#FAFAF8] px-3 py-1.5 rounded-lg transition-colors">
                My Profile
              </Link>
              <Link href="/dashboard"
                className="text-sm font-semibold text-[#6B7280] hover:text-[#1C1C1E] hover:bg-[#FAFAF8] px-3 py-1.5 rounded-lg transition-colors">
                Applications
              </Link>
            </>
          )}
          {role === "COMPANY" && (
            <>
              <Link href="/company/jobs"
                className="text-sm font-semibold text-[#6B7280] hover:text-[#1C1C1E] hover:bg-[#FAFAF8] px-3 py-1.5 rounded-lg transition-colors">
                My Jobs
              </Link>
              <Link href="/company/setup"
                className="text-sm font-semibold text-[#6B7280] hover:text-[#1C1C1E] hover:bg-[#FAFAF8] px-3 py-1.5 rounded-lg transition-colors">
                Company Profile
              </Link>
              <Link href="/company/billing"
                className="text-sm font-semibold text-[#6B7280] hover:text-[#1C1C1E] hover:bg-[#FAFAF8] px-3 py-1.5 rounded-lg transition-colors">
                Billing
              </Link>
            </>
          )}
          <Link href="/blog"
            className="text-sm font-semibold text-[#6B7280] hover:text-[#1C1C1E] hover:bg-[#FAFAF8] px-3 py-1.5 rounded-lg transition-colors">
            Blog
          </Link>
          {isAdmin && (
            <Link href="/admin"
              className="text-sm font-semibold text-[#6B7280] hover:text-[#1C1C1E] hover:bg-[#FAFAF8] px-3 py-1.5 rounded-lg transition-colors">
              Admin
            </Link>
          )}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3 shrink-0">
          {session?.user ? (
            <>
              <span className="text-sm text-[#9CA3AF] hidden sm:block max-w-[140px] truncate">
                {session.user.name ?? session.user.email}
              </span>
              <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }) }}>
                <button type="submit" className="text-sm font-semibold text-[#6B7280] hover:text-[#1C1C1E] transition-colors">
                  Sign out
                </button>
              </form>
              {role === "COMPANY" && (
                <Link href="/company/jobs/new"
                  className="bg-[#F97316] text-white text-sm font-bold px-4 py-2 rounded-[11px] shadow-[0_6px_15px_rgba(249,115,22,0.3)] hover:bg-[#EA580C] transition-colors">
                  + Post a Job
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/login"
                className="text-sm font-semibold text-[#3A3A3C] hover:text-[#1C1C1E] transition-colors">
                Sign in
              </Link>
              <Link href="/company/jobs/new"
                className="bg-[#F97316] text-white text-sm font-bold px-4 py-2 rounded-[11px] shadow-[0_6px_15px_rgba(249,115,22,0.3)] hover:bg-[#EA580C] transition-colors">
                Post a Job
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

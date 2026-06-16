import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { signOut } from "@/auth"

const NAV = [
  { href: "/company/jobs", label: "My Jobs" },
  { href: "/company/jobs/new", label: "Post a Job" },
  { href: "/company/setup", label: "Company Profile" },
  { href: "/company/billing", label: "Billing" },
]

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "COMPANY") redirect("/")

  return (
    <div className="min-h-screen bg-[#FAFAF8]">

      <header className="border-b border-[#F0EEE8] bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-[8px] bg-[#F97316] flex items-center justify-center shadow-[0_3px_8px_rgba(249,115,22,0.35)]">
                <span className="text-white font-mono font-bold text-xs leading-none">&gt;_</span>
              </div>
              <span className="text-[17px] font-extrabold text-[#1C1C1E] tracking-tight leading-none">IT Hire</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map(({ href, label }) => (
                <Link key={href} href={href}
                  className="text-sm font-semibold text-[#6B7280] hover:text-[#1C1C1E] hover:bg-[#FFF7ED] px-3 py-1.5 rounded-lg transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-[#9CA3AF] hidden sm:block">
              {session.user.name ?? session.user.email}
            </span>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }) }}>
              <button type="submit" className="text-sm font-semibold text-[#6B7280] hover:text-[#1C1C1E] transition-colors">
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden border-t border-[#F0EEE8] overflow-x-auto">
          <nav className="flex items-center gap-1 px-4 py-2">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href}
                className="text-sm font-semibold text-[#6B7280] hover:text-[#1C1C1E] whitespace-nowrap px-3 py-1.5 rounded-lg hover:bg-[#FFF7ED] transition-colors">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

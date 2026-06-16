"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV = [
  { href: "/company/jobs", label: "My Jobs" },
  { href: "/company/jobs/new", label: "Post a Job" },
  { href: "/company/setup", label: "Company Profile" },
  { href: "/company/billing", label: "Billing" },
]

function isActive(href: string, pathname: string) {
  if (href === "/company/jobs/new") return pathname === "/company/jobs/new"
  if (href === "/company/jobs") {
    return (
      pathname === "/company/jobs" ||
      (pathname.startsWith("/company/jobs/") && !pathname.startsWith("/company/jobs/new"))
    )
  }
  return pathname.startsWith(href)
}

export default function CompanySidebarNav() {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV.map(({ href, label }) => {
        const active = isActive(href, pathname)
        return (
          <Link key={href} href={href}
            className={`flex items-center gap-3 text-sm font-semibold px-3 py-2.5 rounded-xl transition-colors ${
              active
                ? "bg-[#FFF1E1] text-[#C2410C]"
                : "text-[#6B7280] hover:text-[#1C1C1E] hover:bg-[#F4F2EC]"
            }`}>
            <span className={`w-2 h-2 rounded-sm flex-none ${active ? "bg-[#F97316]" : "bg-[#D6D2C8]"}`} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

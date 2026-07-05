"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const TABS = [
  {
    href: "/company/jobs",
    label: "My Jobs",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#F97316" : "#9CA3AF"} strokeWidth={2.2}>
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
      </svg>
    ),
  },
  {
    href: "/company/jobs/new",
    label: "Post Job",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#F97316" : "#9CA3AF"} strokeWidth={2.2}>
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    ),
  },
  {
    href: "/company/setup",
    label: "Profile",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#F97316" : "#9CA3AF"} strokeWidth={2.2}>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
      </svg>
    ),
  },
  {
    href: "/company/billing",
    label: "Billing",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#F97316" : "#9CA3AF"} strokeWidth={2.2}>
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
]

function isActive(href: string, pathname: string) {
  if (href === "/company/jobs/new") return pathname === "/company/jobs/new"
  if (href === "/company/jobs") {
    return pathname === "/company/jobs" ||
      (pathname.startsWith("/company/jobs/") && !pathname.startsWith("/company/jobs/new"))
  }
  return pathname.startsWith(href)
}

export default function CompanyBottomNav() {
  const pathname = usePathname()
  return (
    /* hidden on desktop (lg+) */
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#F0EEE8] flex items-stretch h-[60px] shadow-[0_-4px_16px_rgba(28,28,30,0.06)]">
      {TABS.map(tab => {
        const active = isActive(tab.href, pathname)
        return (
          <Link key={tab.href} href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-colors ${
              active ? "text-[#F97316]" : "text-[#9CA3AF]"
            }`}>
            {tab.icon(active)}
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}

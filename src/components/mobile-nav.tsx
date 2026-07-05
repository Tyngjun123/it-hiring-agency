"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

type MobileNavProps = {
  role?: string | null
  isAdmin?: boolean
  displayName?: string
  companyProfileId?: string | null
  isSignedIn?: boolean
  notifUnread?: number
}

export default function MobileNav({
  role,
  isAdmin,
  displayName,
  companyProfileId,
  isSignedIn,
  notifUnread = 0,
}: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function openAuth(mode: "login" | "register", asCompany?: boolean) {
    const sp = new URLSearchParams(params.toString())
    sp.set("auth", mode)
    if (asCompany) sp.set("role", "company")
    setOpen(false)
    router.push(`${pathname}?${sp.toString()}`, { scroll: false })
  }

  return (
    <>
      {/* Hamburger button — visible only on mobile */}
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(o => !o)}
        className="lg:hidden flex flex-col justify-center items-center gap-[5px] w-11 h-11 rounded-[10px] hover:bg-[#F4F2EC] transition-colors shrink-0"
      >
        <span className={`block h-[2px] w-5 bg-[#1C1C1E] rounded-full transition-all duration-200 ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
        <span className={`block h-[2px] w-5 bg-[#1C1C1E] rounded-full transition-all duration-200 ${open ? "opacity-0" : ""}`} />
        <span className={`block h-[2px] w-5 bg-[#1C1C1E] rounded-full transition-all duration-200 ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
      </button>

      {/* Drawer — slides down below navbar */}
      {open && (
        <div className="lg:hidden fixed inset-0 top-14 z-40" onClick={() => setOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#1C1C1E]/20 backdrop-blur-[2px]" />

          {/* Drawer panel */}
          <nav className="relative bg-white border-b border-[#F0EEE8] shadow-[0_8px_30px_rgba(28,28,30,0.12)] px-4 py-4 flex flex-col gap-1"
            onClick={e => e.stopPropagation()}>

            <Link href="/" onClick={() => setOpen(false)}
              className="text-[15px] font-bold text-[#F97316] px-3 py-3 rounded-xl">
              Find Jobs
            </Link>
            <Link href="/companies" onClick={() => setOpen(false)}
              className="text-[15px] font-semibold text-[#3A3A3C] hover:bg-[#FAFAF8] px-3 py-3 rounded-xl transition-colors">
              Companies
            </Link>

            {isSignedIn && (
              <Link href="/notifications" onClick={() => setOpen(false)}
                className="flex items-center justify-between text-[15px] font-semibold text-[#3A3A3C] hover:bg-[#FAFAF8] px-3 py-3 rounded-xl transition-colors">
                Notifications
                {notifUnread > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#F97316] text-white text-[11px] font-extrabold flex items-center justify-center">
                    {notifUnread > 9 ? "9+" : notifUnread}
                  </span>
                )}
              </Link>
            )}

            {role === "INTERVIEWEE" && (
              <>
                <Link href="/profile" onClick={() => setOpen(false)}
                  className="text-[15px] font-semibold text-[#3A3A3C] hover:bg-[#FAFAF8] px-3 py-3 rounded-xl transition-colors">
                  My Profile
                </Link>
                <Link href="/dashboard" onClick={() => setOpen(false)}
                  className="text-[15px] font-semibold text-[#3A3A3C] hover:bg-[#FAFAF8] px-3 py-3 rounded-xl transition-colors">
                  Applications
                </Link>
              </>
            )}

            {role === "COMPANY" && (
              <>
                <Link href="/company/jobs" onClick={() => setOpen(false)}
                  className="text-[15px] font-semibold text-[#3A3A3C] hover:bg-[#FAFAF8] px-3 py-3 rounded-xl transition-colors">
                  Dashboard
                </Link>
                <Link href="/company/billing" onClick={() => setOpen(false)}
                  className="text-[15px] font-semibold text-[#3A3A3C] hover:bg-[#FAFAF8] px-3 py-3 rounded-xl transition-colors">
                  Billing
                </Link>
              </>
            )}

            <Link href="/about" onClick={() => setOpen(false)}
              className="text-[15px] font-semibold text-[#3A3A3C] hover:bg-[#FAFAF8] px-3 py-3 rounded-xl transition-colors">
              About
            </Link>
            <Link href="/blog" onClick={() => setOpen(false)}
              className="text-[15px] font-semibold text-[#3A3A3C] hover:bg-[#FAFAF8] px-3 py-3 rounded-xl transition-colors">
              Blog
            </Link>

            {isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)}
                className="text-[15px] font-semibold text-[#3A3A3C] hover:bg-[#FAFAF8] px-3 py-3 rounded-xl transition-colors">
                Admin
              </Link>
            )}

            <div className="my-2 h-px bg-[#F0EEE8]" />

            {isSignedIn ? (
              <>
                {displayName && (
                  <div className="px-3 py-2">
                    {role === "COMPANY" && companyProfileId ? (
                      <Link href={`/companies/${companyProfileId}`} onClick={() => setOpen(false)}
                        className="text-[14px] font-semibold text-[#F97316]">{displayName}</Link>
                    ) : (
                      <p className="text-[14px] text-[#9CA3AF] truncate">{displayName}</p>
                    )}
                  </div>
                )}
                {role === "COMPANY" && (
                  <Link href="/company/jobs/new" onClick={() => setOpen(false)}
                    className="mx-3 mb-1 bg-[#F97316] hover:bg-[#EA580C] text-white text-[15px] font-bold px-4 py-3 rounded-[11px] text-center transition-colors">
                    + Post a Job
                  </Link>
                )}
              </>
            ) : (
              <>
                <button onClick={() => openAuth("login")}
                  className="text-left text-[15px] font-semibold text-[#3A3A3C] hover:bg-[#FAFAF8] px-3 py-3 rounded-xl transition-colors">
                  Sign in
                </button>
                <button onClick={() => openAuth("register", true)}
                  className="mx-3 bg-[#F97316] hover:bg-[#EA580C] text-white text-[15px] font-bold px-4 py-3 rounded-[11px] text-center transition-colors">
                  Post a Job
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  )
}

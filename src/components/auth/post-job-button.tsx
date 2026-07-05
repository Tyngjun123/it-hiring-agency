"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"

// For signed-out users: opens the register modal pre-set to the Company tab.
export default function PostJobButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function open() {
    const sp = new URLSearchParams(params.toString())
    sp.set("auth", "register")
    sp.set("role", "company")
    router.push(`${pathname}?${sp.toString()}`, { scroll: false })
  }

  return (
    <button onClick={open} className={className}>
      {children}
    </button>
  )
}

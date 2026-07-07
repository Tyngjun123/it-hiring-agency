"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"

// Opens the auth modal in register mode (defaults to the Candidate tab).
export default function SignUpButton({ className }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function open() {
    const sp = new URLSearchParams(params.toString())
    sp.set("auth", "register")
    router.push(`${pathname}?${sp.toString()}`, { scroll: false })
  }

  return (
    <button onClick={open} className={className}>
      Sign Up
    </button>
  )
}

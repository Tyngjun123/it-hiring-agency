"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"

export default function SignInButton({ className }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function open() {
    const sp = new URLSearchParams(params.toString())
    sp.set("auth", "login")
    router.push(`${pathname}?${sp.toString()}`, { scroll: false })
  }

  return (
    <button onClick={open} className={className}>
      Sign in
    </button>
  )
}

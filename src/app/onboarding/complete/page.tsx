"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function CompletePage() {
  const [count, setCount] = useState(3)
  const router = useRouter()

  useEffect(() => {
    if (count === 0) {
      router.push("/")
      return
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-3">
        <div className="text-5xl">🎉</div>
        <h1 className="text-2xl font-semibold text-gray-900">You&apos;re all set!</h1>
        <p className="text-gray-500">Redirecting to home in {count}s…</p>
      </div>
    </div>
  )
}

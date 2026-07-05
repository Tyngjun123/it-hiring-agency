"use client"

import { useRouter, useSearchParams } from "next/navigation"

const OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "pay_high", label: "Highest pay" },
]

export default function JobSort() {
  const router = useRouter()
  const params = useSearchParams()
  const current = params.get("sort") ?? "newest"

  function change(v: string) {
    const sp = new URLSearchParams(params.toString())
    if (v === "newest") sp.delete("sort")
    else sp.set("sort", v)
    sp.delete("page")
    router.push(`/?${sp.toString()}`)
  }

  return (
    <select
      value={current}
      onChange={(e) => change(e.target.value)}
      aria-label="Sort jobs"
      className="text-sm font-semibold text-[#4B5563] bg-white border border-[#E6E2D9] rounded-[10px] pl-3 pr-7 py-1.5 focus:outline-none focus:border-[#F97316] cursor-pointer"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>Sort: {o.label}</option>
      ))}
    </select>
  )
}

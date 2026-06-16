"use client"

import { useRouter, useSearchParams } from "next/navigation"

const WORK_TYPES = [
  { value: "", label: "All" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ONSITE", label: "On-site" },
]

export default function JobFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get("workType") ?? ""

  function apply(workType: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (workType) params.set("workType", workType)
    else params.delete("workType")
    params.delete("page")
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-[#9A968C] font-semibold">Work type:</span>
      {WORK_TYPES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => apply(value)}
          className={`text-sm font-semibold px-5 py-2 rounded-full border transition-colors ${
            current === value
              ? "bg-[#F97316] text-white border-[#F97316] shadow-[0_5px_13px_rgba(249,115,22,0.28)]"
              : "bg-white text-[#4B5563] border-[#E6E2D9] hover:border-[#F97316] hover:text-[#F97316]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

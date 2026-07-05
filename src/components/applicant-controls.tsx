"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "PENDING", label: "Under Review" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEWING", label: "Interviewing" },
  { value: "SUCCESS", label: "Hired" },
  { value: "FAIL", label: "Not Selected" },
]

const SORTS = [
  { value: "recent", label: "Most recent" },
  { value: "match", label: "Best match" },
]

export default function ApplicantControls({ status, sort }: { status: string; sort: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function setParam(key: string, val: string, clearWhen: string) {
    const sp = new URLSearchParams(params.toString())
    if (val === clearWhen) sp.delete(key)
    else sp.set(key, val)
    const qs = sp.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const selectCls =
    "text-[13px] font-semibold text-[#4B5563] bg-white border border-[#E6E2D9] rounded-[10px] pl-3 pr-7 py-1.5 focus:outline-none focus:border-[#F97316] cursor-pointer"

  return (
    <div className="flex items-center gap-2">
      <select value={status} onChange={(e) => setParam("status", e.target.value, "all")} className={selectCls} aria-label="Filter by status">
        {STATUS_FILTERS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <select value={sort} onChange={(e) => setParam("sort", e.target.value, "recent")} className={selectCls} aria-label="Sort applicants">
        {SORTS.map((o) => <option key={o.value} value={o.value}>Sort: {o.label}</option>)}
      </select>
    </div>
  )
}

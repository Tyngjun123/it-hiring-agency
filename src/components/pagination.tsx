"use client"

import { useRouter, useSearchParams } from "next/navigation"

type Props = {
  page: number
  totalPages: number
}

export default function Pagination({ page, totalPages }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  function go(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (p === 1) params.delete("page")
    else params.set("page", String(p))
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-center gap-1.5 pt-4">
      <button
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className="w-9 h-9 rounded-[10px] border border-[#E6E2D9] bg-white flex items-center justify-center text-sm text-[#9CA3AF] hover:bg-[#FCFCFA] disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ←
      </button>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => go(p)}
            className={`w-9 h-9 rounded-[10px] text-sm font-semibold transition-colors ${
              p === page
                ? "bg-[#F97316] text-white shadow-[0_5px_13px_rgba(249,115,22,0.28)]"
                : "bg-white text-[#4B5563] border border-[#E6E2D9] hover:bg-[#FFF7ED] hover:text-[#C2410C]"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        className="w-9 h-9 rounded-[10px] border border-[#E6E2D9] bg-white flex items-center justify-center text-sm text-[#4B5563] hover:bg-[#FCFCFA] disabled:opacity-30 disabled:cursor-not-allowed"
      >
        →
      </button>
    </div>
  )
}

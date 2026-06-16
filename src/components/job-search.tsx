"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useRef } from "react"

export default function JobSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const qRef = useRef<HTMLInputElement>(null)
  const locRef = useRef<HTMLInputElement>(null)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = qRef.current?.value.trim() ?? ""
    const location = locRef.current?.value.trim() ?? ""
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (location) params.set("location", location)
    router.push(`/?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch}
      className="flex items-center bg-white border border-[#EFE7DA] rounded-2xl shadow-[0_10px_30px_rgba(28,28,30,0.08)] overflow-hidden">

      {/* Keyword */}
      <div className="flex items-center flex-1 px-4 gap-2.5">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#F97316" strokeWidth={2.2}>
          <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>
        </svg>
        <input
          ref={qRef}
          defaultValue={searchParams.get("q") ?? ""}
          type="text"
          placeholder="Job title, skill or company"
          className="w-full py-3.5 text-sm text-[#1C1C1E] placeholder-[#A8A49A] focus:outline-none bg-transparent"
        />
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-[#ECE9E1] shrink-0" />

      {/* Location */}
      <div className="flex items-center flex-1 px-4 gap-2.5">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.2}>
          <circle cx="12" cy="10" r="3" stroke="#F97316"/>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#F97316" fill="none"/>
        </svg>
        <input
          ref={locRef}
          defaultValue={searchParams.get("location") ?? ""}
          type="text"
          placeholder="Location (e.g. Kuala Lumpur)"
          className="w-full py-3.5 text-sm text-[#1C1C1E] placeholder-[#A8A49A] focus:outline-none bg-transparent"
        />
      </div>

      {/* Search button */}
      <button type="submit"
        className="bg-[#F97316] hover:bg-[#EA580C] transition-colors text-white px-7 py-3.5 text-sm font-bold flex items-center gap-2 shrink-0 shadow-[0_6px_15px_rgba(249,115,22,0.32)] rounded-r-2xl">
        Search
      </button>
    </form>
  )
}

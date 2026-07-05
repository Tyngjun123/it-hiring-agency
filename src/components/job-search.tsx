"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import LocationDropdown from "@/components/location-dropdown"

export default function JobSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(searchParams.get("q") ?? "")
  const [location, setLocation] = useState(searchParams.get("location") ?? "")

  const hasFilters = q.trim() !== "" || location.trim() !== ""

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q.trim()) params.set("q", q.trim())
    if (location.trim()) params.set("location", location.trim())
    router.push(`/?${params.toString()}`)
  }

  function handleClear() {
    setQ("")
    setLocation("")
    router.push("/")
  }

  return (
    <form onSubmit={handleSearch}
      className="flex flex-col md:flex-row md:items-center bg-white border border-[#EFE7DA] rounded-2xl shadow-[0_10px_30px_rgba(28,28,30,0.08)] overflow-visible relative">

      {/* Keyword */}
      <div className="flex items-center flex-1 px-4 gap-2.5">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#F97316" strokeWidth={2.2}>
          <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>
        </svg>
        <input
          name="q"
          value={q}
          onChange={e => setQ(e.target.value)}
          type="text"
          placeholder="Job title, skill or company"
          className="w-full py-3.5 text-sm text-[#1C1C1E] placeholder-[#A8A49A] focus:outline-none bg-transparent"
        />
      </div>

      {/* Horizontal divider (mobile) / vertical (desktop) */}
      <div className="hidden md:block w-px h-6 bg-[#ECE9E1] shrink-0" />
      <div className="md:hidden h-px bg-[#ECE9E1] mx-4" />

      {/* Location with dropdown */}
      <LocationDropdown value={location} onValueChange={setLocation} name="location" />

      {/* Actions — Search + clear share one row, on mobile too (so clear sits to the
          right of Search instead of stacking below and pushing the listings down) */}
      <div className="flex shrink-0">
        <button type="submit"
          className={`flex-1 md:flex-none bg-[#F97316] hover:bg-[#EA580C] transition-colors text-white px-7 py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-[0_6px_15px_rgba(249,115,22,0.32)] ${hasFilters ? "rounded-bl-2xl md:rounded-none" : "rounded-b-2xl md:rounded-b-none md:rounded-r-2xl"}`}>
          Search
        </button>

        {/* Clear button — appears after Search once there's an active query */}
        {hasFilters && (
          <button type="button" onClick={handleClear} aria-label="Clear search" title="Clear search"
            className="flex items-center justify-center shrink-0 px-4 py-3.5 text-[#9CA3AF] hover:text-[#F97316] hover:bg-[#FFF7ED] transition-colors border-l border-[#ECE9E1] rounded-br-2xl md:rounded-br-none md:rounded-r-2xl">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>
            </svg>
          </button>
        )}
      </div>
    </form>
  )
}

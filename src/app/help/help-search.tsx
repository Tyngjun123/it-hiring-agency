"use client"

import { createContext, useContext, useState } from "react"
import Link from "next/link"

type HelpSearchCtx = { query: string; setQuery: (q: string) => void }

const HelpSearchContext = createContext<HelpSearchCtx>({ query: "", setQuery: () => {} })

export function useHelpSearch() {
  return useContext(HelpSearchContext)
}

export function HelpSearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("")
  return (
    <HelpSearchContext.Provider value={{ query, setQuery }}>
      {children}
    </HelpSearchContext.Provider>
  )
}

// The hero search box — a real input wired to the shared query state.
export function HelpSearchInput() {
  const { query, setQuery } = useHelpSearch()
  return (
    <div className="flex items-center gap-2.5 bg-white border border-[#EFE7DA] rounded-[14px] px-4 py-1.5 shadow-[0_10px_30px_rgba(28,28,30,0.08)] max-w-[540px] mx-auto">
      <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2.2">
        <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for help…"
        aria-label="Search help articles"
        className="flex-1 text-[15px] text-[#1C1C1E] placeholder:text-[#A8A49A] bg-transparent border-0 outline-none py-3"
      />
      <Link href="/contact"
        className="bg-[#F97316] hover:bg-[#EA580C] text-white text-[14px] font-bold px-5 py-2.5 rounded-[10px] transition-colors shrink-0">
        Contact us
      </Link>
    </div>
  )
}

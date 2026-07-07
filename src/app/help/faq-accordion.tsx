"use client"

import { useState } from "react"
import { HELP_FAQS, type Faq } from "@/data/faqs"

export default function FAQAccordion({ faqs = HELP_FAQS }: { faqs?: Faq[] }) {
  const [activeCategory, setActiveCategory] = useState("All")
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  // Categories derived from the FAQs actually present (so admin edits flow through).
  const categories = ["All", ...Array.from(new Set(faqs.map((f) => f.category).filter((c): c is string => !!c)))]

  const filtered = activeCategory === "All"
    ? faqs
    : faqs.filter((f) => f.category === activeCategory)

  return (
    <div>
      {/* Category chips — horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto md:flex-wrap md:justify-center mb-8 scrollbar-hide pb-1 -mb-1">
        {categories.map((cat) => (
          <button key={cat} onClick={() => { setActiveCategory(cat); setOpenIndex(null) }}
            className={`text-[13.5px] font-bold px-[18px] py-[9px] rounded-full transition-all shrink-0 ${
              activeCategory === cat
                ? "bg-[#F97316] text-white shadow-[0_5px_13px_rgba(249,115,22,0.26)]"
                : "bg-white text-[#4B5563] border border-[#E6E2D9] hover:border-[#F97316]/50"
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion */}
      <div className="max-w-[720px] mx-auto flex flex-col gap-3">
        {filtered.map((faq, i) => {
          const isOpen = openIndex === i
          return (
            <div key={i} className="bg-white border border-[#EEEBE3] rounded-[14px] overflow-hidden shadow-[0_1px_2px_rgba(28,28,30,0.03)]">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-[18px] text-left">
                <span className="text-[15.5px] font-bold text-[#1C1C1E]">{faq.q}</span>
                <span className={`w-[26px] h-[26px] rounded-[8px] flex items-center justify-center text-[17px] font-bold shrink-0 transition-colors ${
                  isOpen ? "bg-[#FFF1E1] text-[#F97316]" : "bg-[#F6F4EE] text-[#9CA3AF]"
                }`}>
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-[14.5px] leading-[1.65] text-[#4B5563]">
                  {faq.a}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

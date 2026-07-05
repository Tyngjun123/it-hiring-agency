"use client"

import { useEffect, useState } from "react"

type Item = { id: string; label: string }

export default function OnThisPage({ sections }: { sections: Item[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "")

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          // Highlight the section closest to the top of the viewport
          const nearest = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
          )
          setActive(nearest.target.id)
        }
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: 0 },
    )

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections])

  return (
    <div className="flex flex-col gap-0.5">
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          onClick={() => setActive(s.id)}
          className={`text-[13.5px] font-semibold px-3 py-2 rounded-[9px] transition-colors ${
            active === s.id
              ? "font-bold text-[#C2410C] bg-[#FFF1E1]"
              : "text-[#6B7280] hover:text-[#1C1C1E] hover:bg-[#F6F4EE]"
          }`}
        >
          {s.label}
        </a>
      ))}
    </div>
  )
}

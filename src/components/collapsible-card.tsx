"use client"

import { useState } from "react"

// A profile card whose body collapses/expands when the header is clicked.
// Collapsed shows just the title + count, so the card shrinks. (Design:
// "Profile - Header + Roles" — collapsible roles/skills.)
export default function CollapsibleCard({
  title,
  count,
  countLabel = "selected",
  description,
  defaultOpen = true,
  children,
}: {
  title: string
  count?: number
  countLabel?: string
  description?: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <p className="text-base font-bold text-[#1C1C1E]">{title}</p>
        <span className="flex items-center gap-2.5 shrink-0">
          {typeof count === "number" && (
            <span className="text-xs text-[#9CA3AF]">
              <span className="text-[#F97316] font-bold">{count}</span> {countLabel}
            </span>
          )}
          <span className="w-[22px] h-[22px] rounded-[7px] bg-[#FFF1E1] border border-[#F7C99A] flex items-center justify-center text-[10px] text-[#F97316] font-extrabold leading-none">
            {open ? "▾" : "▸"}
          </span>
        </span>
      </button>

      {open && (
        <div className="mt-4">
          {description && <p className="text-xs text-[#9CA3AF] mb-4">{description}</p>}
          {children}
        </div>
      )}
    </div>
  )
}

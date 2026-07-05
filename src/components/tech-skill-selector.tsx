"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { TECH_SKILL_CATEGORIES, YEAR_OPTIONS } from "@/data/tech-skills"

type Skill = { language: string; yearsExp: number }

type Props = {
  existing?: Skill[]
  onSave: (skills: Skill[]) => Promise<unknown>
  redirectAfter?: string
  showSkip?: boolean
  skipTo?: string
  submitLabel?: string
  /** When provided, only these skill categories are shown (collapses unrelated ones). */
  allowedCategories?: string[] | null
}

export default function TechSkillSelector({
  existing = [],
  onSave,
  redirectAfter,
  showSkip,
  skipTo,
  submitLabel = "Save skills",
  allowedCategories = null,
}: Props) {
  const router = useRouter()

  const categories = Object.entries(TECH_SKILL_CATEGORIES).filter(
    ([category]) => !allowedCategories || allowedCategories.includes(category)
  )

  const [selected, setSelected] = useState<Map<string, number>>(
    () => new Map(existing.map((s) => [s.language, s.yearsExp]))
  )
  const [loading, setLoading] = useState(false)

  // Each category is collapsible. Open by default the ones that already have a
  // selected skill (so existing picks are visible); otherwise open just the first.
  const [openCats, setOpenCats] = useState<Set<string>>(() => {
    const open = new Set<string>()
    const sel = new Set(existing.map((s) => s.language))
    categories.forEach(([cat, skills]) => {
      if (skills.some((sk) => sel.has(sk))) open.add(cat)
    })
    if (open.size === 0 && categories.length > 0) open.add(categories[0][0])
    return open
  })

  function toggleCat(cat: string) {
    setOpenCats((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  function toggle(lang: string) {
    setSelected((prev) => {
      const next = new Map(prev)
      if (next.has(lang)) next.delete(lang)
      else next.set(lang, 1)
      return next
    })
  }

  function setYears(lang: string, years: number) {
    setSelected((prev) => {
      const next = new Map(prev)
      next.set(lang, years)
      return next
    })
  }

  async function handleSave() {
    setLoading(true)
    const skills = Array.from(selected.entries()).map(([language, yearsExp]) => ({ language, yearsExp }))
    await onSave(skills)
    toast.success("Skills saved")
    if (redirectAfter) router.push(redirectAfter)
    setLoading(false)
  }

  const selectedCount = selected.size

  return (
    <div className="space-y-6">

      {/* Category skill grids — each skill appears ONCE, toggling between selected/unselected */}
      <div className="space-y-4">
        {categories.map(([category, skills]) => {
          const open = openCats.has(category)
          const catCount = skills.filter((s) => selected.has(s)).length
          return (
          <div key={category} className="space-y-2">
            <button type="button" onClick={() => toggleCat(category)}
              className="w-full flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="w-[18px] h-[18px] rounded-[6px] bg-[#FFF1E1] border border-[#F7C99A] flex items-center justify-center text-[9px] text-[#F97316] font-extrabold leading-none">
                  {open ? "▾" : "▸"}
                </span>
                <span className="text-xs font-bold text-[#9A968C] uppercase tracking-widest">{category}</span>
              </span>
              {catCount > 0 && (
                <span className="text-[11px] text-[#9CA3AF]">
                  <span className="text-[#F97316] font-bold">{catCount}</span> selected
                </span>
              )}
            </button>
            {open && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => {
                const isSelected = selected.has(skill)
                const yrs = selected.get(skill) ?? 1
                return (
                  <div key={skill} className="flex items-center">
                    {isSelected ? (
                      <div className="flex items-center gap-1 bg-[#FFF1E1] border-[1.5px] border-[#F97316] text-[#C2410C] text-sm font-semibold px-3 py-1.5 rounded-full">
                        <button type="button" onClick={() => toggle(skill)} className="font-bold">
                          ✓ {skill}
                        </button>
                        <select
                          value={yrs}
                          onChange={(e) => setYears(skill, Number(e.target.value))}
                          className="text-xs bg-transparent border-none focus:outline-none text-[#C2410C] cursor-pointer ml-1"
                        >
                          {YEAR_OPTIONS.map((y) => (
                            <option key={y} value={y}>{y}{y === 10 ? "+" : ""}yr</option>
                          ))}
                        </select>
                        <button type="button" onClick={() => toggle(skill)}
                          className="text-[#F97316] hover:text-red-500 font-bold leading-none ml-0.5">×</button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggle(skill)}
                        className="text-sm font-semibold bg-[#F6F4EE] text-[#4B5563] border-[1.5px] border-[#EAE7DF] px-3.5 py-1.5 rounded-full hover:border-[#F97316] hover:text-[#C2410C] transition-colors"
                      >
                        {skill}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
            )}
          </div>
          )
        })}
      </div>

      {/* Footer: selected count + save */}
      <div className="space-y-2 pt-2 border-t border-[#F0EEE8]">
        <p className="text-xs text-[#9CA3AF] text-right">
          <span className="text-[#F97316] font-bold">{selectedCount}</span> skill{selectedCount !== 1 ? "s" : ""} selected
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-60 text-white font-bold py-3 rounded-[11px] shadow-[0_6px_15px_rgba(249,115,22,0.3)] transition-colors"
        >
          {loading ? "Saving…" : submitLabel}
        </button>
        {showSkip && skipTo && (
          <button type="button" onClick={() => router.push(skipTo)}
            className="w-full text-sm text-[#9CA3AF] hover:text-[#6B7280] py-1">
            Skip for now
          </button>
        )}
      </div>

    </div>
  )
}

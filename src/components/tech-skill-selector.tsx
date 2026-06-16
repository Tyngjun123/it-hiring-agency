"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TECH_SKILL_CATEGORIES, YEAR_OPTIONS } from "@/data/tech-skills"

type Skill = { language: string; yearsExp: number }

type Props = {
  existing?: Skill[]
  onSave: (skills: Skill[]) => Promise<unknown>
  redirectAfter?: string
  showSkip?: boolean
  skipTo?: string
  submitLabel?: string
}

export default function TechSkillSelector({
  existing = [],
  onSave,
  redirectAfter,
  showSkip,
  skipTo,
  submitLabel = "Save skills",
}: Props) {
  const router = useRouter()

  const [selected, setSelected] = useState<Map<string, number>>(
    () => new Map(existing.map((s) => [s.language, s.yearsExp]))
  )
  const [loading, setLoading] = useState(false)

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
    if (redirectAfter) router.push(redirectAfter)
    setLoading(false)
  }

  const selectedCount = selected.size

  return (
    <div className="space-y-6">

      {/* Category skill grids — each skill appears ONCE, toggling between selected/unselected */}
      <div className="space-y-4">
        {Object.entries(TECH_SKILL_CATEGORIES).map(([category, skills]) => (
          <div key={category} className="space-y-2">
            <p className="text-xs font-bold text-[#9A968C] uppercase tracking-widest">{category}</p>
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
          </div>
        ))}
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

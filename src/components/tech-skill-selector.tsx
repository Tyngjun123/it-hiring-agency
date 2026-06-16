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

  function removeSkill(lang: string) {
    setSelected((prev) => {
      const next = new Map(prev)
      next.delete(lang)
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

  const selectedList = Array.from(selected.entries())

  return (
    <div className="space-y-6">

      {/* Selected skills */}
      {selectedList.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#1C1C1E]">
            Selected <span className="text-[#F97316]">({selectedList.length})</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedList.map(([lang, yrs]) => (
              <div key={lang}
                className="flex items-center gap-1.5 bg-[#FFF1E1] border border-[#F97316] text-[#C2410C] text-sm px-3 py-1 rounded-full">
                <span className="font-bold">{lang}</span>
                <select
                  value={yrs}
                  onChange={(e) => setYears(lang, Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs bg-transparent border-none focus:outline-none text-[#C2410C] cursor-pointer"
                >
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>{y}{y === 10 ? "+" : ""}yr</option>
                  ))}
                </select>
                <button type="button" onClick={() => removeSkill(lang)}
                  className="text-[#F97316] hover:text-red-500 leading-none ml-0.5 font-bold">×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predefined categories */}
      <div className="space-y-4">
        {Object.entries(TECH_SKILL_CATEGORIES).map(([category, skills]) => (
          <div key={category} className="space-y-2">
            <p className="text-xs font-bold text-[#9A968C] uppercase tracking-widest">{category}</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => {
                const isSelected = selected.has(skill)
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggle(skill)}
                    className={`text-sm font-semibold px-3.5 py-1.5 rounded-full border-[1.5px] transition-colors ${
                      isSelected
                        ? "bg-[#FFF1E1] text-[#C2410C] border-[#F97316]"
                        : "bg-[#F6F4EE] text-[#4B5563] border-[#EAE7DF] hover:border-[#F97316] hover:text-[#C2410C]"
                    }`}
                  >
                    {isSelected && <span className="mr-1 text-xs">✓</span>}{skill}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-2">
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

"use client"

import { useState } from "react"
import type { EditablePlan } from "@/data/plans"

// Edits the 3 pricing plans' copy + feature lists. Serializes to a hidden JSON
// input named `name` so it saves through the existing saveCmsContent form.
export default function PlanEditor({ name, initial }: { name: string; initial: EditablePlan[] }) {
  const [plans, setPlans] = useState<EditablePlan[]>(initial)

  function patch(i: number, p: Partial<EditablePlan>) {
    setPlans((prev) => prev.map((pl, idx) => (idx === i ? { ...pl, ...p } : pl)))
  }
  function setFeature(i: number, fi: number, value: string) {
    setPlans((prev) => prev.map((pl, idx) => (idx === i ? { ...pl, features: pl.features.map((f, j) => (j === fi ? value : f)) } : pl)))
  }
  function addFeature(i: number) {
    setPlans((prev) => prev.map((pl, idx) => (idx === i ? { ...pl, features: [...pl.features, ""] } : pl)))
  }
  function removeFeature(i: number, fi: number) {
    setPlans((prev) => prev.map((pl, idx) => (idx === i ? { ...pl, features: pl.features.filter((_, j) => j !== fi) } : pl)))
  }

  // Drop empty feature lines before saving.
  const cleaned = plans.map((p) => ({ ...p, features: p.features.filter((f) => f.trim()) }))
  const inputCls = "w-full rounded-[9px] border border-[#E6E2D9] focus:border-[#F97316] focus:outline-none px-3 py-2 text-sm"

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={JSON.stringify(cleaned)} />

      {plans.map((pl, i) => (
        <div key={i} className="border border-[#EEEBE3] rounded-xl p-4 space-y-2.5 bg-[#FCFBF9]">
          <p className="text-xs font-extrabold text-[#F97316] uppercase tracking-wide">Plan {i + 1}</p>
          <div className="grid grid-cols-2 gap-2">
            <input value={pl.name} onChange={(e) => patch(i, { name: e.target.value })} placeholder="Name" className={inputCls} />
            <input value={pl.price} onChange={(e) => patch(i, { price: e.target.value })} placeholder="Price (e.g. RM 200)" className={inputCls} />
            <input value={pl.period} onChange={(e) => patch(i, { period: e.target.value })} placeholder="Period (e.g. per month)" className={inputCls} />
            <input value={pl.bestFor} onChange={(e) => patch(i, { bestFor: e.target.value })} placeholder="Best for…" className={inputCls} />
          </div>
          <input value={pl.tagline} onChange={(e) => patch(i, { tagline: e.target.value })} placeholder="Tagline" className={inputCls} />

          <p className="text-[12px] font-bold text-[#9CA3AF] pt-1">Features</p>
          {pl.features.map((f, fi) => (
            <div key={fi} className="flex items-center gap-2">
              <input value={f} onChange={(e) => setFeature(i, fi, e.target.value)} placeholder="Feature" className={inputCls} />
              <button type="button" onClick={() => removeFeature(i, fi)} className="text-xs font-bold text-[#DC2626] hover:underline shrink-0">✕</button>
            </div>
          ))}
          <button type="button" onClick={() => addFeature(i)} className="text-[13px] font-bold text-[#F97316] hover:text-[#EA580C]">+ Add feature</button>
        </div>
      ))}
    </div>
  )
}

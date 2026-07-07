"use client"

import { useState } from "react"
import type { Faq } from "@/data/faqs"

// Editable list of Q&A rows. Serializes to a hidden input (JSON) named `name`
// so it saves through the existing saveCmsContent form action.
export default function FaqEditor({
  name,
  initial,
  categories,
}: {
  name: string
  initial: Faq[]
  categories?: string[]
}) {
  const [items, setItems] = useState<Faq[]>(
    initial.length ? initial : [{ q: "", a: "", ...(categories ? { category: categories[0] } : {}) }]
  )

  function update(i: number, patch: Partial<Faq>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  }
  function remove(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i))
  }
  function add() {
    setItems((prev) => [...prev, { q: "", a: "", ...(categories ? { category: categories[0] } : {}) }])
  }

  // Only persist rows that actually have a question.
  const cleaned = items.filter((it) => it.q.trim())

  const inputCls = "w-full rounded-[9px] border border-[#E6E2D9] focus:border-[#F97316] focus:outline-none px-3 py-2 text-sm"

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(cleaned)} />

      {items.map((it, i) => (
        <div key={i} className="border border-[#EEEBE3] rounded-xl p-3.5 space-y-2 bg-[#FCFBF9]">
          <div className="flex items-center gap-2">
            {categories && (
              <select
                value={it.category ?? categories[0]}
                onChange={(e) => update(i, { category: e.target.value })}
                className="rounded-[9px] border border-[#E6E2D9] px-2.5 py-2 text-xs font-semibold text-[#3A3A3C] bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
            <span className="text-xs font-bold text-[#9CA3AF]">Q{i + 1}</span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="ml-auto text-xs font-bold text-[#DC2626] hover:underline"
            >
              Remove
            </button>
          </div>
          <input
            value={it.q}
            onChange={(e) => update(i, { q: e.target.value })}
            placeholder="Question"
            className={inputCls + " font-semibold"}
          />
          <textarea
            value={it.a}
            onChange={(e) => update(i, { a: e.target.value })}
            placeholder="Answer"
            rows={3}
            className={inputCls + " resize-y"}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="text-sm font-bold text-[#F97316] hover:text-[#EA580C]"
      >
        + Add question
      </button>
    </div>
  )
}

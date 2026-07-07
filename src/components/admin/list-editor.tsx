"use client"

import { useState } from "react"

export type Field = { key: string; label: string; textarea?: boolean; small?: boolean }

// Generic editable list of objects (add/remove rows). Serializes to a hidden
// JSON input named `name` so it saves through the existing saveCmsContent form.
export default function ListEditor({
  name,
  initial,
  fields,
  itemLabel = "Item",
}: {
  name: string
  initial: Record<string, string>[]
  fields: Field[]
  itemLabel?: string
}) {
  const empty = () => Object.fromEntries(fields.map((f) => [f.key, ""])) as Record<string, string>
  const [items, setItems] = useState<Record<string, string>[]>(initial.length ? initial : [empty()])

  function update(i: number, key: string, value: string) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)))
  }
  function remove(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i))
  }
  function add() {
    setItems((prev) => [...prev, empty()])
  }

  // Keep only rows with at least one non-empty field.
  const cleaned = items.filter((it) => fields.some((f) => (it[f.key] ?? "").trim()))
  const inputCls = "w-full rounded-[9px] border border-[#E6E2D9] focus:border-[#F97316] focus:outline-none px-3 py-2 text-sm"

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(cleaned)} />

      {items.map((it, i) => (
        <div key={i} className="border border-[#EEEBE3] rounded-xl p-3.5 space-y-2 bg-[#FCFBF9]">
          <div className="flex items-center">
            <span className="text-xs font-bold text-[#9CA3AF]">{itemLabel} {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="ml-auto text-xs font-bold text-[#DC2626] hover:underline">Remove</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {fields.map((f) =>
              f.textarea ? (
                <textarea key={f.key} value={it[f.key] ?? ""} onChange={(e) => update(i, f.key, e.target.value)}
                  placeholder={f.label} rows={2} className={inputCls + " resize-y"} />
              ) : (
                <input key={f.key} value={it[f.key] ?? ""} onChange={(e) => update(i, f.key, e.target.value)}
                  placeholder={f.label} className={inputCls + (f.small ? " w-20 shrink-0" : "")} />
              )
            )}
          </div>
        </div>
      ))}

      <button type="button" onClick={add} className="text-sm font-bold text-[#F97316] hover:text-[#EA580C]">+ Add {itemLabel.toLowerCase()}</button>
    </div>
  )
}

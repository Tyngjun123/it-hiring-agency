"use client"

import { useState } from "react"
import { setCompanyPlan } from "@/app/actions/admin"

type Props = {
  companyId: string
  currentPlan: "FREE" | "PRO" | "MAX"
  currentExpiry: string | null // YYYY-MM-DD or null
}

const PLAN_OPTIONS: { value: "FREE" | "PRO" | "MAX"; label: string }[] = [
  { value: "FREE", label: "Free" },
  { value: "PRO", label: "Pro" },
  { value: "MAX", label: "Max" },
]

export default function CompanyPlanEditor({ companyId, currentPlan, currentExpiry }: Props) {
  const [plan, setPlan] = useState(currentPlan)
  const [forever, setForever] = useState(currentExpiry === null && currentPlan !== "FREE")
  const [expiry, setExpiry] = useState(currentExpiry ?? "")

  const isFree = plan === "FREE"
  // Date input only relevant for paid plans that are NOT set to forever
  const dateDisabled = isFree || forever

  return (
    <form action={setCompanyPlan} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="companyId" value={companyId} />

      {/* Plan */}
      <div className="space-y-1">
        <label className="block text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Plan</label>
        <select
          name="plan"
          value={plan}
          onChange={(e) => setPlan(e.target.value as typeof plan)}
          className="border border-[#E6E2D9] rounded-[9px] px-3 py-2 text-sm bg-white text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
        >
          {PLAN_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Expiry date */}
      <div className="space-y-1">
        <label className="block text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Expires on</label>
        <input
          type="date"
          name="planExpiresAt"
          value={expiry}
          disabled={dateDisabled}
          onChange={(e) => setExpiry(e.target.value)}
          className="border border-[#E6E2D9] rounded-[9px] px-3 py-2 text-sm bg-white text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#F97316] disabled:bg-[#F4F1EA] disabled:text-[#C4BFB5] disabled:cursor-not-allowed"
        />
      </div>

      {/* Forever */}
      <label className={`flex items-center gap-2 pb-2.5 ${isFree ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
        <input
          type="checkbox"
          name="forever"
          checked={forever}
          disabled={isFree}
          onChange={(e) => setForever(e.target.checked)}
          className="w-4 h-4 rounded border-[#D1C9BB] text-[#F97316] focus:ring-[#F97316]/30"
        />
        <span className="text-[13px] font-semibold text-[#3A3A3C]">Forever</span>
      </label>

      <button
        type="submit"
        className="bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold px-4 py-2 rounded-[9px] shadow-[0_4px_10px_rgba(249,115,22,0.3)] transition-colors"
      >
        Save
      </button>
    </form>
  )
}

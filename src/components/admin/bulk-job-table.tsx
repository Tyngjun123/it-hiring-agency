"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { toggleJobHot, adjustJobPriority, bulkUpdateJobStatus } from "@/app/actions/cms"

type Job = {
  id: string
  title: string
  status: string
  isHot: boolean
  priority: number
  location: string
  company: { companyName: string }
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "bg-[#ECFDF5] text-[#16A34A]",
  DRAFT: "bg-[#F4F1EA] text-[#9CA3AF]",
  PAUSED: "bg-[#FEF3C7] text-[#D97706]",
  CLOSED: "bg-[#FEF2F2] text-[#DC2626]",
}

function JobRow({ job, selected, onToggle }: {
  job: Job
  selected: boolean
  onToggle: () => void
}) {
  const router = useRouter()
  const [pending, start] = useTransition()

  function run(fn: () => Promise<unknown>, msg: string) {
    start(async () => { await fn(); toast.success(msg); router.refresh() })
  }

  return (
    <div className={`px-5 py-4 flex items-center gap-4 transition-colors ${selected ? "bg-[#FFF7ED]/40" : ""} ${pending ? "opacity-60 pointer-events-none" : ""}`}>
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        className="w-4 h-4 rounded border-[#D1C9BB] text-[#F97316] focus:ring-[#F97316]/30 cursor-pointer shrink-0"
      />

      <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-sm font-bold shrink-0 ${
        job.priority > 0 ? "bg-[#FFF7ED] text-[#F97316]" : "bg-[#F4F1EA] text-[#9CA3AF]"
      }`}>
        {job.priority}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[14px] font-bold text-[#1C1C1E] truncate">{job.title}</p>
          {job.isHot && (
            <span className="text-[11px] font-bold bg-[#FFF7ED] text-[#F97316] border border-[#FBDDBE] px-2 py-0.5 rounded-full">
              🔥 Hot
            </span>
          )}
        </div>
        <p className="text-[12.5px] text-[#9CA3AF] mt-0.5 truncate">
          {job.company.companyName} · {job.location}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => run(() => toggleJobHot(job.id, !job.isHot), job.isHot ? "Hot tag removed" : "Marked as Hot")}
          className={`text-xs font-bold px-3 py-1.5 rounded-[8px] transition-colors ${
            job.isHot
              ? "bg-[#FFF7ED] text-[#F97316] border border-[#FBDDBE] hover:bg-[#FFE4C4]"
              : "bg-[#F4F1EA] text-[#9CA3AF] hover:bg-[#EEEBE3] hover:text-[#6B7280]"
          }`}>
          {job.isHot ? "🔥 Hot" : "Set Hot"}
        </button>

        <button
          onClick={() => run(() => adjustJobPriority(job.id, "up"), "Priority updated")}
          className="w-8 h-8 flex items-center justify-center rounded-[8px] bg-[#F4F1EA] hover:bg-[#EEEBE3] text-[#6B7280] transition-colors text-sm font-bold"
          title="Increase priority">↑
        </button>
        <button
          onClick={() => run(() => adjustJobPriority(job.id, "down"), "Priority updated")}
          className="w-8 h-8 flex items-center justify-center rounded-[8px] bg-[#F4F1EA] hover:bg-[#EEEBE3] text-[#6B7280] transition-colors text-sm font-bold"
          title="Decrease priority">↓
        </button>

        <Link href={`/jobs/${job.id}`} target="_blank"
          className="text-xs font-bold text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
          View ↗
        </Link>
      </div>
    </div>
  )
}

export default function BulkJobTable({ jobs }: { jobs: Job[] }) {
  const router = useRouter()
  const [bulkPending, startBulk] = useTransition()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<"ACTIVE" | "PAUSED" | "CLOSED">("CLOSED")

  const activeJobs = jobs.filter((j) => j.status === "ACTIVE")
  const otherJobs = jobs.filter((j) => j.status !== "ACTIVE")
  const allIds = jobs.map((j) => j.id)

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(selected.size === allIds.length ? new Set() : new Set(allIds))
  }

  function applyBulk() {
    if (selected.size === 0) return
    if (bulkAction === "CLOSED") {
      const ok = window.confirm(
        `Close ${selected.size} job listing${selected.size > 1 ? "s" : ""}? They will be removed from the public homepage.`
      )
      if (!ok) return
    }
    const count = selected.size
    startBulk(async () => {
      await bulkUpdateJobStatus(Array.from(selected), bulkAction)
      setSelected(new Set())
      toast.success(`${count} job${count > 1 ? "s" : ""} updated to ${bulkAction.toLowerCase()}`)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-[#FFF7ED] border border-[#FBDDBE] rounded-xl px-4 py-3 flex-wrap">
          <span className="text-sm font-bold text-[#92400E]">{selected.size} selected</span>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value as typeof bulkAction)}
            className="border border-[#FBDDBE] rounded-[8px] px-3 py-1.5 text-sm bg-white text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          >
            <option value="ACTIVE">Set Active</option>
            <option value="PAUSED">Set Paused</option>
            <option value="CLOSED">Set Closed</option>
          </select>
          <button
            onClick={applyBulk}
            disabled={bulkPending}
            className="bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 text-white text-sm font-bold px-4 py-1.5 rounded-[8px] transition-colors"
          >
            {bulkPending ? "Applying…" : "Apply"}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-sm text-[#9CA3AF] hover:text-[#6B7280] ml-auto"
          >
            Clear
          </button>
        </div>
      )}

      {/* Active jobs */}
      <div className="bg-white border border-[#EEEBE3] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)]">
        <div className="px-5 py-3.5 border-b border-[#F4F1EA] bg-[#FAFAF8] flex items-center gap-3">
          <input
            type="checkbox"
            checked={allIds.length > 0 && selected.size === allIds.length}
            onChange={toggleAll}
            className="w-4 h-4 rounded border-[#D1C9BB] text-[#F97316] focus:ring-[#F97316]/30 cursor-pointer"
          />
          <p className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider">
            Active listings ({activeJobs.length})
          </p>
        </div>
        {activeJobs.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#9CA3AF]">No active listings</div>
        ) : (
          <div className="divide-y divide-[#F4F1EA]">
            {activeJobs.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                selected={selected.has(job.id)}
                onToggle={() => toggle(job.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Non-active jobs */}
      {otherJobs.length > 0 && (
        <div className="bg-white border border-[#EEEBE3] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)]">
          <div className="px-5 py-3.5 border-b border-[#F4F1EA] bg-[#FAFAF8]">
            <p className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider">
              Draft / Paused / Closed ({otherJobs.length})
            </p>
          </div>
          <div className="divide-y divide-[#F4F1EA]">
            {otherJobs.map((job) => (
              <div key={job.id} className={`px-5 py-4 flex items-center gap-4 ${selected.has(job.id) ? "bg-[#FFF7ED]/40" : "opacity-60"}`}>
                <input
                  type="checkbox"
                  checked={selected.has(job.id)}
                  onChange={() => toggle(job.id)}
                  className="w-4 h-4 rounded border-[#D1C9BB] text-[#F97316] focus:ring-[#F97316]/30 cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#1C1C1E] truncate">{job.title}</p>
                  <p className="text-[12.5px] text-[#9CA3AF] mt-0.5 truncate">{job.company.companyName}</p>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLOR[job.status]}`}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

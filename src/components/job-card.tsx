"use client"

import { useRouter } from "next/navigation"

type JobCardProps = {
  id: string
  companyId?: string
  title: string
  companyName: string | null
  location: string
  workType: string
  payRangeFrom: number
  payRangeTo: number
  sellingPoint1: string
  sellingPoint2: string
  sellingPoint3: string
  isBoosted?: boolean
}

const AVATAR_PALETTE = [
  { bg: "#E8FBEF", fg: "#067647" },
  { bg: "#FFF7ED", fg: "#EA580C" },
  { bg: "#EFF6FF", fg: "#1D4ED8" },
  { bg: "#FEF2F2", fg: "#DC2626" },
  { bg: "#F5F3FF", fg: "#7C3AED" },
  { bg: "#ECFDF5", fg: "#059669" },
  { bg: "#FFF1E1", fg: "#C2410C" },
  { bg: "#F0F9FF", fg: "#0369A1" },
]

const WORK_TYPE_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  REMOTE: { bg: "#ECFDF5", color: "#047857", label: "Remote" },
  HYBRID: { bg: "#EFF6FF", color: "#1D4ED8", label: "Hybrid" },
  ONSITE: { bg: "#F3F4F6", color: "#4B5563", label: "On-site" },
}

function avatarFor(name: string) {
  return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length]
}

function formatPay(n: number) {
  return `RM ${n.toLocaleString()}`
}

export default function JobCard({
  id, companyId, title, companyName, location, workType,
  payRangeFrom, payRangeTo, sellingPoint1, sellingPoint2, sellingPoint3,
  isBoosted,
}: JobCardProps) {
  const router = useRouter()
  const av = companyName ? avatarFor(companyName) : { bg: "#F3F4F6", fg: "#6B7280" }
  const badge = WORK_TYPE_BADGE[workType]

  return (
    <div
      onClick={() => router.push(`/jobs/${id}`)}
      className="bg-white border border-[#EEEBE3] rounded-2xl p-5 shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)] hover:shadow-[0_2px_4px_rgba(28,28,30,0.05),0_14px_34px_rgba(28,28,30,0.09)] transition-shadow cursor-pointer"
    >
      <div className="flex items-start gap-3.5">
        {/* Company avatar */}
        <div
          className="w-12 h-12 rounded-[13px] flex items-center justify-center font-extrabold text-lg shrink-0"
          style={{ background: av.bg, color: av.fg }}
        >
          {companyName ? companyName.charAt(0).toUpperCase() : "?"}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title + badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-[16px] font-bold text-[#1C1C1E] leading-snug">{title}</h3>
              <p className="text-[13.5px] text-[#6B7280] mt-0.5">
                {companyName ? (
                  companyId ? (
                    <a href={`/companies/${companyId}`} onClick={(e) => e.stopPropagation()}
                      className="hover:text-[#F97316] transition-colors">
                      {companyName}
                    </a>
                  ) : companyName
                ) : "Confidential"} · {location}
              </p>
            </div>
            {badge && (
              <span
                className="text-[11.5px] font-bold px-3 py-1 rounded-full shrink-0 whitespace-nowrap"
                style={{ background: badge.bg, color: badge.color }}
              >
                {badge.label}
              </span>
            )}
          </div>

          {/* Salary */}
          <p className="text-[15px] font-bold text-[#1C1C1E] mt-3">
            {formatPay(payRangeFrom)} – {formatPay(payRangeTo)}
            <span className="text-xs font-medium text-[#9CA3AF]"> / month</span>
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {[sellingPoint1, sellingPoint2, sellingPoint3].filter(Boolean).map((point, i) => (
              <span key={i} className="text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] px-3 py-1 rounded-full">
                {point}
              </span>
            ))}
            {isBoosted && (
              <span className="text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] px-3 py-1 rounded-full border border-[#FBDDBE]">
                ★ Featured
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end mt-4 pt-3 border-t border-[#F4F1EA]">
            <span className="text-[13.5px] font-bold text-[#F97316]">View job →</span>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"

// Collapsible "Preferred Roles" section that lives INSIDE the profile identity
// card (per the "Profile - Header + Roles" design) — no card chrome of its own.
// Read-only chips; click the header row to collapse/expand.
export default function PreferredRolesSection({ roles }: { roles: string[] }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="mt-5 pt-5 border-t border-[#F0EDE6] text-left">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2"
      >
        <span className="text-[11px] font-bold text-[#9A968C] uppercase tracking-[0.06em]">
          Preferred Roles
        </span>
        <span className="flex items-center gap-2 shrink-0">
          <span className="text-[11.5px] text-[#9CA3AF]">
            <span className="text-[#F97316] font-bold">{roles.length}</span> selected
          </span>
          <span className="w-[22px] h-[22px] rounded-[7px] bg-[#FFF1E1] border border-[#F7C99A] flex items-center justify-center text-[10px] text-[#F97316] font-extrabold leading-none">
            {open ? "▾" : "▸"}
          </span>
        </span>
      </button>

      {open &&
        (roles.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-3">
            {roles.map((r) => (
              <span key={r}
                className="text-[12.5px] font-bold px-3 py-1.5 rounded-full bg-[#FFF1E1] text-[#C2410C] border-[1.5px] border-[#F7C99A]">
                {r}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[12.5px] text-[#9CA3AF] mt-3">No preferred roles set yet.</p>
        ))}
    </div>
  )
}

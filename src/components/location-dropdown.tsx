"use client"

import { useState, useRef, useEffect } from "react"

const MALAYSIA_STATES = [
  "Johor", "Kedah", "Kelantan", "Malacca", "Negeri Sembilan",
  "Pahang", "Penang", "Perak", "Perlis", "Selangor",
  "Terengganu", "Sabah", "Sarawak", "Kuala Lumpur", "Putrajaya", "Labuan",
]

const MALAYSIA_CITIES = [
  "Kuala Lumpur", "Petaling Jaya", "Subang Jaya", "Shah Alam", "Cyberjaya", "Putrajaya",
  "Klang", "Ampang", "Cheras", "Kepong", "Puchong", "Seri Kembangan",
  "George Town", "Butterworth", "Bukit Mertajam", "Bayan Lepas",
  "Johor Bahru", "Skudai", "Iskandar Puteri",
  "Ipoh", "Taiping", "Teluk Intan",
  "Kota Kinabalu", "Sandakan", "Tawau",
  "Kuching", "Miri", "Sibu",
  "Kota Bharu", "Kuala Terengganu", "Alor Setar",
  "Seremban", "Nilai", "Port Dickson",
  "Melaka", "Muar",
  "Kuantan", "Temerloh",
  "Remote (Malaysia)", "Malaysia (All States)",
]

const ALL_LOCATIONS = [...MALAYSIA_STATES, ...MALAYSIA_CITIES.filter(c => !MALAYSIA_STATES.includes(c))]

const POPULAR = ["Kuala Lumpur", "Selangor", "Penang", "Johor", "Cyberjaya", "Sabah", "Sarawak", "Remote (Malaysia)"]

export default function LocationDropdown({
  value,
  onValueChange,
  name,
}: {
  value: string
  onValueChange: (v: string) => void
  name?: string
}) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const filtered = value.trim()
    ? ALL_LOCATIONS.filter(c => c.toLowerCase().includes(value.toLowerCase())).slice(0, 10)
    : POPULAR

  function select(city: string) {
    onValueChange(city)
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative flex items-center flex-1 px-4 gap-2.5">
      {/* Hidden input for form submission */}
      {name && <input type="hidden" name={name} value={value} />}

      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.2}>
        <circle cx="12" cy="10" r="3" stroke="#F97316" />
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#F97316" fill="none" />
      </svg>

      <input
        type="text"
        value={value}
        onChange={e => { onValueChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="Location (e.g. Kuala Lumpur)"
        className="w-full py-3.5 text-sm text-[#1C1C1E] placeholder-[#A8A49A] focus:outline-none bg-transparent"
      />

      {open && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-[#EAE8E2] rounded-[14px] shadow-[0_8px_30px_rgba(28,28,30,0.14)] z-50 overflow-hidden">
          <div className="px-4 py-2.5 text-[11px] font-bold text-[#9A968C] uppercase tracking-wider border-b border-[#F4F2EC]">
            {value.trim() ? "Suggestions" : "Popular locations"}
          </div>
          {filtered.length > 0 ? (
            <div className="py-1 max-h-56 overflow-y-auto">
              {filtered.map(city => (
                <button key={city} type="button"
                  onMouseDown={e => { e.preventDefault(); select(city) }}
                  className="w-full text-left px-4 py-2.5 text-[13.5px] font-medium text-[#1C1C1E] hover:bg-[#FFF7ED] flex items-center gap-3 transition-colors">
                  <svg className="w-3.5 h-3.5 text-[#F97316] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <circle cx="12" cy="10" r="3" />
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  </svg>
                  {city}
                </button>
              ))}
            </div>
          ) : (
            <p className="px-4 py-3 text-sm text-[#9CA3AF]">No locations found</p>
          )}
        </div>
      )}
    </div>
  )
}

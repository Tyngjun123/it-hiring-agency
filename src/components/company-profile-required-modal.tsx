"use client"

import { useRouter } from "next/navigation"

export default function CompanyProfileRequiredModal() {
  const router = useRouter()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(28,28,30,0.18)] p-8 max-w-sm w-full mx-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-[#FBDDBE] flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-[#F97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>

        <h2 className="text-[18px] font-extrabold text-[#1C1C1E] tracking-tight">
          Complete your company profile
        </h2>
        <p className="text-sm text-[#6B7280] mt-2 mb-6 leading-relaxed">
          You need to set up your company profile before you can access this page.
          It only takes a minute.
        </p>

        <button
          onClick={() => router.push("/company/setup")}
          className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-[11px] h-11 shadow-[0_4px_10px_rgba(249,115,22,0.3)] transition-colors"
        >
          Set up company profile →
        </button>
      </div>
    </div>
  )
}

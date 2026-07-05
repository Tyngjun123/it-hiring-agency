"use client"

import { useEffect } from "react"
import Link from "next/link"
import { LogoTile, Wordmark } from "@/components/brand"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to console in dev — swap for Sentry/Logtail in production
    console.error("[App Error]", error)
  }, [error])

  const isDbError =
    error.message?.toLowerCase().includes("database") ||
    error.message?.toLowerCase().includes("prisma") ||
    error.message?.toLowerCase().includes("can't reach") ||
    error.message?.toLowerCase().includes("connection")

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <LogoTile size={40} variant="onDark" />
        <Wordmark className="text-[22px] font-extrabold text-[#1C1C1E] tracking-tight" />
      </div>

      <div className="w-full max-w-md bg-white border border-[#EEEBE3] rounded-[22px] p-10 text-center shadow-[0_1px_2px_rgba(28,28,30,0.03),0_20px_50px_rgba(28,28,30,0.08)]">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-[#FFF7ED] flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-[#F97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
          </svg>
        </div>

        <h1 className="text-[24px] font-extrabold text-[#1C1C1E] tracking-tight mb-2">
          {isDbError ? "We'll be right back" : "Something went wrong"}
        </h1>

        <p className="text-[15px] text-[#6B7280] leading-relaxed mb-7">
          {isDbError
            ? "We're doing a quick bit of maintenance. The site will be back up in a few minutes."
            : "An unexpected error occurred. Our team has been notified."}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-[15px] py-3.5 rounded-[12px] shadow-[0_8px_18px_rgba(249,115,22,0.3)] transition-colors">
            Try again
          </button>
          <Link
            href="/"
            className="w-full border border-[#E6E2D9] text-[#3A3A3C] font-bold text-[15px] py-3.5 rounded-[12px] hover:border-[#F97316] hover:text-[#F97316] transition-colors">
            Back to home
          </Link>
        </div>
      </div>

      <p className="mt-8 text-[13px] text-[#B6B2A8]">
        Need help?{" "}
        <Link href="/contact" className="text-[#F97316] hover:underline font-semibold">
          Contact us
        </Link>
      </p>
    </div>
  )
}

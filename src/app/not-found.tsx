import Link from "next/link"
import { LogoTile, Wordmark } from "@/components/brand"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-6 text-center">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-14">
        <LogoTile size={32} variant="onDark" />
        <Wordmark className="text-[17px] font-extrabold text-[#1C1C1E]" />
      </Link>

      {/* Big 404 */}
      <p className="font-mono text-[72px] md:text-[128px] font-black leading-none text-[#F97316] tracking-[-0.04em] select-none">
        404
      </p>

      {/* Code comment */}
      <p className="font-mono text-[15px] text-[#9CA3AF] mt-2 mb-5">
        // page not found
      </p>

      {/* Headline */}
      <h1 className="text-[28px] md:text-[32px] font-extrabold text-[#1C1C1E] tracking-[-0.03em] mb-2.5">
        This page took a coffee break.
      </h1>
      <p className="text-[16px] text-[#6B7280] max-w-sm leading-relaxed mb-9">
        The page you were looking for doesn&apos;t exist or may have moved.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:justify-center">
        <Link href="/"
          className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-[15px] px-7 py-3.5 rounded-[12px] shadow-[0_7px_18px_rgba(249,115,22,0.3)] transition-colors">
          Back to home
        </Link>
        <Link href="/jobs"
          className="bg-white border-[1.5px] border-[#E6E2D9] hover:border-[#F97316]/50 hover:bg-[#FFF7ED] text-[#1C1C1E] font-bold text-[15px] px-7 py-3.5 rounded-[12px] transition-colors">
          Browse jobs
        </Link>
      </div>
    </div>
  )
}

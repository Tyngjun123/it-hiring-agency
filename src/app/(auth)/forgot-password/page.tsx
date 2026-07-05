import ForgotPasswordForm from "@/components/auth/forgot-password-form"
import Link from "next/link"
import { LogoTile, Wordmark } from "@/components/brand"

export default function ForgotPasswordPage() {
  return (
    <div className="bg-white border border-[#EEEBE3] rounded-[22px] p-8 md:p-10 max-w-[440px] mx-auto shadow-[0_1px_2px_rgba(28,28,30,.04),0_20px_50px_rgba(28,28,30,.10)]">
      <div className="flex items-center gap-2.5 mb-7 justify-center">
        <LogoTile size={32} variant="onDark" />
        <Wordmark className="text-[#1C1C1E] text-[20px] font-extrabold tracking-tight" />
      </div>

      <ForgotPasswordForm />

      <p className="text-center text-[13px] text-[#9CA3AF] mt-6">
        Remembered it?{" "}
        <Link href="/login" className="font-bold text-[#F97316] hover:text-[#EA580C]">Sign in</Link>
      </p>
    </div>
  )
}

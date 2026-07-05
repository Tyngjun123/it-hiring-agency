"use client"

import { useState } from "react"
import { requestPasswordReset, resetPassword } from "@/app/actions/auth"

const inputCls =
  "w-full border border-[#E6E2D9] rounded-[11px] px-3.5 py-3 text-[14px] text-[#1C1C1E] placeholder-[#A8A49A] focus:outline-none focus:border-[#F97316] transition-colors"

export default function ForgotPasswordForm({ onBackToLogin }: { onBackToLogin?: () => void }) {
  const [step, setStep] = useState<"email" | "reset" | "done">("email")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(""); setLoading(true)
    const fd = new FormData(e.currentTarget)
    setEmail((fd.get("email") as string).trim().toLowerCase())
    const res = await requestPasswordReset(fd)
    setLoading(false)
    if (res?.error) setError(res.error)
    else setStep("reset")
  }

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(""); setLoading(true)
    const fd = new FormData(e.currentTarget)
    fd.set("email", email)
    const res = await resetPassword(fd)
    setLoading(false)
    if (res?.error) setError(res.error)
    else setStep("done")
  }

  if (step === "done") {
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#ECFDF5] text-[#16A34A] flex items-center justify-center text-xl mx-auto">✓</div>
        <h2 className="text-[20px] font-extrabold text-[#1C1C1E]">Password updated</h2>
        <p className="text-[14px] text-[#6B7280]">You can now sign in with your new password.</p>
        {onBackToLogin
          ? <button onClick={onBackToLogin} className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-3 rounded-[12px]">Back to sign in</button>
          : <a href="/login" className="block w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-3 rounded-[12px]">Back to sign in</a>}
      </div>
    )
  }

  if (step === "reset") {
    return (
      <form onSubmit={handleReset} className="space-y-4">
        <div className="text-center mb-2">
          <h2 className="text-[22px] font-extrabold text-[#1C1C1E]">Enter reset code</h2>
          <p className="text-[13.5px] text-[#6B7280] mt-1">We sent a 6-digit code to <strong>{email}</strong> (valid 10 min).</p>
        </div>
        <div className="space-y-1.5">
          <label className="block text-[13px] font-bold text-[#3A3A3C]">Enter the 6-digit code</label>
          <input name="code" inputMode="numeric" maxLength={6} required placeholder="••••••" autoFocus
            className={`${inputCls} tracking-[8px] text-center font-bold text-[18px]`} />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[13px] font-bold text-[#3A3A3C]">New password</label>
          <input name="password" type="password" required placeholder="Min. 8 characters" className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[13px] font-bold text-[#3A3A3C]">Confirm new password</label>
          <input name="confirm" type="password" required placeholder="Re-enter new password" className={inputCls} />
        </div>
        {error && <p className="text-sm text-[#DC2626] font-medium">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-60 text-white font-bold py-3.5 rounded-[12px] shadow-[0_8px_18px_rgba(249,115,22,.3)]">
          {loading ? "Updating…" : "Reset password"}
        </button>
        <button type="button" onClick={() => setStep("email")} className="w-full text-sm text-[#9CA3AF] hover:text-[#6B7280]">← Use a different email</button>
      </form>
    )
  }

  return (
    <form onSubmit={handleRequest} className="space-y-4">
      <div className="text-center mb-2">
        <h2 className="text-[22px] font-extrabold text-[#1C1C1E]">Forgot password?</h2>
        <p className="text-[13.5px] text-[#6B7280] mt-1">Enter your email and we'll send you a reset code.</p>
      </div>
      <input name="email" type="email" required placeholder="you@example.com" className={inputCls} />
      {error && <p className="text-sm text-[#DC2626] font-medium">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-60 text-white font-bold py-3.5 rounded-[12px] shadow-[0_8px_18px_rgba(249,115,22,.3)]">
        {loading ? "Sending…" : "Send reset code"}
      </button>
      {onBackToLogin
        ? <button type="button" onClick={onBackToLogin} className="w-full text-sm text-[#9CA3AF] hover:text-[#6B7280]">← Back to sign in</button>
        : <a href="/login" className="block text-center text-sm text-[#9CA3AF] hover:text-[#6B7280]">← Back to sign in</a>}
    </form>
  )
}

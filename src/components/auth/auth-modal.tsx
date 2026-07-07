"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signInWithCredentials, signUpWithEmail, signInWithGoogle } from "@/app/actions/auth"
import ForgotPasswordForm from "@/components/auth/forgot-password-form"
import { useLockBodyScroll } from "@/lib/use-lock-body-scroll"
import { LogoTile, Wordmark } from "@/components/brand"

type Mode = "login" | "register" | "forgot"

const inputCls =
  "w-full border border-[#E6E2D9] rounded-[11px] px-3.5 py-3 text-[14px] text-[#1C1C1E] placeholder-[#A8A49A] focus:outline-none focus:border-[#F97316] transition-colors"

const GoogleBtn = ({ disabled }: { disabled?: boolean }) => (
  <form action={signInWithGoogle}>
    <button type="submit" disabled={disabled}
      className="w-full flex items-center justify-center gap-2.5 border border-[#E6E2D9] rounded-[12px] px-4 py-3 text-[14px] font-bold text-[#3A3A3C] bg-white hover:bg-[#FAFAF8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    </button>
  </form>
)

export default function AuthModal() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const authParam = params.get("auth") as Mode | null
  const roleParam = params.get("role")
  const registered = params.get("registered")

  const [mode, setMode] = useState<Mode>("login")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<"INTERVIEWEE" | "COMPANY">("INTERVIEWEE")
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    // Reset transient state every time the modal opens — the component is mounted
    // globally and never unmounts, so without this the "loading" flag from a prior
    // (successful) sign-in stays true and leaves the button stuck on "Signing in…".
    if (authParam) { setMode(authParam); setError(""); setLoading(false) }
    if (roleParam === "company") setRole("COMPANY")
    else if (roleParam === "interviewee") setRole("INTERVIEWEE")
  }, [authParam, roleParam])

  const open = !!authParam
  useLockBodyScroll(open)
  if (!open) return null

  function close() {
    router.replace(pathname, { scroll: false })
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setLoading(true)
    const res = await signInWithCredentials(new FormData(e.currentTarget))
    if (res?.error) { setError(res.error); setLoading(false) }
    // on success the action redirects (seeker → home, company → jobs)
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!agreed) { setError("Please agree to the data sharing terms."); return }
    setError(""); setLoading(true)
    const fd = new FormData(e.currentTarget)
    fd.set("role", role)
    const res = await signUpWithEmail(fd)
    if (res?.error) { setError(res.error); setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1C1C1E]/50 backdrop-blur-[2px]" onClick={close} />

      {/* Card */}
      <div className="relative w-full max-w-[420px] bg-white rounded-[20px] p-7 shadow-[0_30px_70px_rgba(28,28,30,.3)] max-h-[92vh] overflow-y-auto">
        <button onClick={close} aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-[#9CA3AF] hover:bg-[#F4F1EA] hover:text-[#1C1C1E] transition-colors text-lg">×</button>

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-5">
          <LogoTile size={32} variant="onDark" />
          <Wordmark className="text-[#1C1C1E] text-[19px] font-extrabold tracking-tight" />
        </div>

        {mode === "forgot" ? (
          <ForgotPasswordForm onBackToLogin={() => setMode("login")} />
        ) : mode === "login" ? (
          <>
            <h2 className="text-[22px] font-extrabold text-[#1C1C1E] mb-1">Welcome back</h2>
            <p className="text-[13.5px] text-[#6B7280] mb-5">Sign in to your StackTalentx account.</p>
            {registered && (
              <div className="mb-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-3 text-sm text-[#15803D] font-semibold">
                Account created! Please sign in.
              </div>
            )}
            <GoogleBtn />
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[#ECE9E1]" /><span className="text-[12px] text-[#B6B2A8]">or</span><div className="flex-1 h-px bg-[#ECE9E1]" />
            </div>
            <form onSubmit={handleLogin} className="space-y-3">
              <input name="email" type="email" required placeholder="you@example.com" className={inputCls} />
              <input name="password" type="password" required placeholder="Password" className={inputCls} />
              {error && <p className="text-sm text-[#DC2626] font-medium">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-60 text-white font-bold py-3 rounded-[12px] shadow-[0_8px_18px_rgba(249,115,22,.3)]">
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
            <div className="flex items-center justify-between mt-4 text-[13px]">
              <button onClick={() => setMode("forgot")} className="font-semibold text-[#F97316] hover:text-[#EA580C]">Forgot password?</button>
              <button onClick={() => { setMode("register"); setError("") }} className="text-[#6B7280]">Create account</button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-[22px] font-extrabold text-[#1C1C1E] mb-1">Create account</h2>
            <p className="text-[13.5px] text-[#6B7280] mb-4">Join StackTalentx — Malaysia&apos;s IT job platform.</p>
            <div className="flex gap-2 bg-[#F4F2EC] rounded-[12px] p-[5px] mb-4">
              {(["INTERVIEWEE", "COMPANY"] as const).map((r) => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={`flex-1 text-[13.5px] font-semibold py-2.5 rounded-[9px] transition-all ${role === r ? "bg-[#1C1C1E] text-white" : "text-[#6B7280]"}`}>
                  {r === "INTERVIEWEE" ? "Candidate" : "Employer"}
                </button>
              ))}
            </div>
            <GoogleBtn disabled={!agreed} />
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[#ECE9E1]" /><span className="text-[12px] text-[#B6B2A8]">or</span><div className="flex-1 h-px bg-[#ECE9E1]" />
            </div>
            <form onSubmit={handleRegister} className="space-y-3">
              <input name="email" type="email" required placeholder="you@example.com" className={inputCls} />
              <input name="password" type="password" required placeholder="Min. 8 characters" className={inputCls} />
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[#D1C9BB] text-[#F97316] focus:ring-[#F97316]/30 shrink-0" />
                <span className="text-[12px] text-[#6B7280] leading-relaxed">
                  I agree to the collection and sharing of my personal data in accordance with the{" "}
                  <Link href="/privacy" target="_blank" className="font-semibold text-[#F97316]">Privacy Policy</Link>
                  {" "}and{" "}
                  <Link href="/terms" target="_blank" className="font-semibold text-[#F97316]">Terms</Link>.
                </span>
              </label>
              {error && <p className="text-sm text-[#DC2626] font-medium">{error}</p>}
              <button type="submit" disabled={loading || !agreed}
                className="w-full bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-[12px] shadow-[0_8px_18px_rgba(249,115,22,.3)]">
                {loading ? "Creating…" : "Create account"}
              </button>
            </form>
            <p className="text-center text-[13px] text-[#6B7280] mt-4">
              Already have an account?{" "}
              <button onClick={() => { setMode("login"); setError("") }} className="font-bold text-[#F97316]">Sign in</button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

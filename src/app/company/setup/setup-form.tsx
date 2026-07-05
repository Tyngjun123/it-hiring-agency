"use client"

import { useState } from "react"
import { useActionState } from "react"
import { setupCompanyProfile } from "@/app/actions/company"

type Props = {
  defaultValues: {
    companyName: string
    personalName: string
    contactEmail: string
    accountEmail: string
    ssm: string
    linkedinUrl: string
    website: string
    description: string
    isSelfEmployed: boolean
    whatsappNumber: string
  }
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-4">{children}</p>
  )
}

function Field({
  label,
  optional,
  children,
}: {
  label: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[13.5px] font-semibold text-[#3A3A3C] block">
        {label}
        {optional && <span className="text-[#9CA3AF] font-normal ml-1">(optional)</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  "w-full border border-[#E6E2D9] rounded-[11px] px-3.5 py-3 text-[14px] text-[#1C1C1E] placeholder-[#A8A49A] focus:outline-none focus:border-[#F97316] transition-colors bg-white"

export default function CompanySetupForm({ defaultValues: d }: Props) {
  const [isSelfEmployed, setIsSelfEmployed] = useState(d.isSelfEmployed)
  const [agreed, setAgreed] = useState(false)
  const [state, action, pending] = useActionState(setupCompanyProfile, null)

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl px-4 py-3 text-sm text-[#DC2626] font-semibold">
          {state.error}
        </div>
      )}

      {/* Account type — at the top so it drives the rest of the form */}
      <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)]">
        <SectionHeader>Account type</SectionHeader>

        <label className="flex items-start gap-3.5 cursor-pointer">
          <input
            type="checkbox"
            name="isSelfEmployed"
            checked={isSelfEmployed}
            onChange={(e) => setIsSelfEmployed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-[#D1C9BB] text-[#F97316] focus:ring-[#F97316]/30 cursor-pointer accent-[#F97316]"
          />
          <div>
            <p className="text-[14px] font-semibold text-[#1C1C1E]">I&apos;m self-employed / hiring without a registered company (no SSM)</p>
            <p className="text-[12.5px] text-[#9CA3AF] mt-0.5 leading-relaxed">
              Your listings will show you as a self-employed individual with your name and WhatsApp contact, instead of a company profile.
            </p>
          </div>
        </label>
      </div>

      {isSelfEmployed ? (
        /* ── Self-employed: just name + WhatsApp (+ contact email) ── */
        <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)] space-y-4">
          <SectionHeader>Your details</SectionHeader>

          <Field label="Full name *">
            <input name="personalName" required placeholder="Your full name" defaultValue={d.personalName} className={inputCls} />
          </Field>

          <Field label="WhatsApp number *">
            <input name="whatsappNumber" type="tel" required placeholder="+60 12-345 6789" defaultValue={d.whatsappNumber} className={inputCls} />
          </Field>

          <Field label="Contact email *">
            <input name="contactEmail" type="email" required placeholder="you@example.com" defaultValue={d.contactEmail || d.accountEmail} className={inputCls} />
          </Field>

          <Field label="About you" optional>
            <textarea name="description" rows={3} placeholder="What kind of help are you hiring for?" defaultValue={d.description}
              className={`${inputCls} resize-none leading-relaxed`} />
          </Field>
        </div>
      ) : (
        /* ── Registered company ── */
        <>
          <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)] space-y-4">
            <SectionHeader>Company details</SectionHeader>

            <Field label="Company name *">
              <input name="companyName" required placeholder="Acme Sdn Bhd" defaultValue={d.companyName} className={inputCls} />
            </Field>

            <Field label="Contact email *">
              <input name="contactEmail" type="email" required placeholder="hr@yourcompany.com" defaultValue={d.contactEmail} className={inputCls} />
            </Field>

            <Field label="SSM Registration No." optional>
              <input name="ssm" placeholder="1234567-A" defaultValue={d.ssm} className={inputCls} />
            </Field>
          </div>

          <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)] space-y-4">
            <SectionHeader>Online presence</SectionHeader>

            <Field label="Website" optional>
              <input name="website" type="url" placeholder="https://yourcompany.com" defaultValue={d.website} className={inputCls} />
            </Field>

            <Field label="LinkedIn" optional>
              <input name="linkedinUrl" type="url" placeholder="https://linkedin.com/company/..." defaultValue={d.linkedinUrl} className={inputCls} />
            </Field>
          </div>

          <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)] space-y-4">
            <SectionHeader>About</SectionHeader>

            <Field label="Company description" optional>
              <textarea name="description" rows={4} placeholder="What does your company do? What's your tech stack? What's the culture like?" defaultValue={d.description}
                className={`${inputCls} resize-none leading-relaxed`} />
            </Field>
          </div>
        </>
      )}

      {/* PDPA consent */}
      <label className="flex items-start gap-3 cursor-pointer px-1">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-[#D1C9BB] text-[#F97316] focus:ring-[#F97316]/30 shrink-0 accent-[#F97316]" />
        <span className="text-[12.5px] text-[#6B7280] leading-relaxed">
          I agree to the collection and sharing of company and applicant data in accordance with the{" "}
          <a href="/privacy" target="_blank" className="font-semibold text-[#F97316] hover:text-[#EA580C]">Privacy Policy</a>
          {" "}and{" "}
          <a href="/terms" target="_blank" className="font-semibold text-[#F97316] hover:text-[#EA580C]">Terms</a>.
        </span>
      </label>

      <button type="submit" disabled={pending || !agreed}
        className="w-full bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-[15px] py-3.5 rounded-[12px] shadow-[0_8px_18px_rgba(249,115,22,0.3)] transition-colors">
        {pending ? "Saving…" : "Save & continue →"}
      </button>
    </form>
  )
}

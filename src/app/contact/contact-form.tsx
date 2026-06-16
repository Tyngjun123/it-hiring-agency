"use client"

import { useState } from "react"
import { sendContactMessage } from "@/app/actions/contact"

const TOPICS = ["Post a Job", "Billing", "Job seeker support", "Partnership"]

export default function ContactForm() {
  const [topic, setTopic] = useState("Post a Job")
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const fd = new FormData(e.currentTarget)
    fd.set("topic", topic)
    await sendContactMessage(fd)
    setPending(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Topic chips */}
      <div className="text-[14px] font-bold text-[#1C1C1E] mb-3">What can we help with?</div>
      <div className="flex flex-wrap gap-2 mb-7">
        {TOPICS.map((t) => (
          <button key={t} type="button" onClick={() => setTopic(t)}
            className={`text-[13.5px] font-bold px-4 py-2 rounded-full border-[1.5px] transition-colors ${
              topic === t
                ? "bg-[#FFF1E1] text-[#C2410C] border-[#F97316]"
                : "bg-white text-[#4B5563] border-[#E6E2D9] hover:border-[#F97316] hover:text-[#C2410C]"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Name + Email row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[13px] font-bold text-[#3A3A3C] mb-1.5">Full name</label>
          <input name="name" required placeholder="Your name"
            className="w-full bg-white border border-[#E6E2D9] rounded-[11px] px-3.5 py-3 text-[14px] text-[#1C1C1E] placeholder-[#A8A49A] focus:border-[#F97316] focus:outline-none transition-colors" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-[#3A3A3C] mb-1.5">Email</label>
          <input name="email" type="email" required placeholder="you@email.com"
            className="w-full bg-white border border-[#E6E2D9] rounded-[11px] px-3.5 py-3 text-[14px] text-[#1C1C1E] placeholder-[#A8A49A] focus:border-[#F97316] focus:outline-none transition-colors" />
        </div>
      </div>

      {/* Company */}
      <div className="mb-4">
        <label className="block text-[13px] font-bold text-[#3A3A3C] mb-1.5">
          Company <span className="text-[#B6B2A8] font-normal">(optional)</span>
        </label>
        <input name="company" placeholder="Company name"
          className="w-full bg-white border border-[#E6E2D9] rounded-[11px] px-3.5 py-3 text-[14px] text-[#1C1C1E] placeholder-[#A8A49A] focus:border-[#F97316] focus:outline-none transition-colors" />
      </div>

      {/* Message */}
      <div className="mb-6">
        <label className="block text-[13px] font-bold text-[#3A3A3C] mb-1.5">Message</label>
        <textarea name="message" required rows={4} placeholder="Tell us how we can help…"
          className="w-full bg-white border border-[#E6E2D9] rounded-[11px] px-3.5 py-3 text-[14px] text-[#1C1C1E] placeholder-[#A8A49A] focus:border-[#F97316] focus:outline-none transition-colors resize-none" />
      </div>

      {/* Submit row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-[12.5px] text-[#9CA3AF] max-w-[220px] leading-relaxed">
          By submitting, you agree to our privacy policy.
        </p>
        <button type="submit" disabled={pending}
          className="bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-60 text-white text-[15px] font-bold px-8 py-3.5 rounded-[12px] shadow-[0_6px_15px_rgba(249,115,22,0.3)] transition-colors">
          {pending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  )
}

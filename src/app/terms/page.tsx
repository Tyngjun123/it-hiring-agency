import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { LogoTile, Wordmark } from "@/components/brand"
import OnThisPage from "./on-this-page"

export const metadata = { title: "Terms of Service — TechireX", description: "TechireX terms of service governing use of the platform by candidates and employers.", alternates: { canonical: "/terms" } }

const SECTIONS = [
  { id: "acceptance", label: "1. Acceptance", title: "1. Acceptance of terms", body: "By accessing or using TechireX (techirex.com), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the platform. These terms apply to all visitors, candidates and employers." },
  {
    id: "using", label: "2. Using TechireX", title: "2. Using TechireX",
    body: "TechireX is a job platform exclusively for technology roles in Malaysia. You agree to use the service only for lawful purposes and in line with these terms.",
    bullets: [
      "Post false, misleading or discriminatory job listings.",
      "Scrape, copy or redistribute listings or candidate data.",
      "Impersonate another person, company or TechireX itself.",
    ],
  },
  { id: "accounts", label: "3. Accounts", title: "3. Accounts", body: "You are responsible for keeping your account credentials secure and for all activity under your account. Candidate accounts are free. Employer accounts may require a paid subscription to access certain features." },
  { id: "postings", label: "4. Job postings", title: "4. Job postings", body: "Employers are solely responsible for the content and accuracy of their listings. TechireX reserves the right to review, edit or remove any posting that violates these terms or applicable Malaysian employment law." },
  {
    id: "resume-pool", label: "5. Resume Pool", title: "5. Resume Pool & employer obligations",
    body: "Employers on an eligible paid subscription may unlock and view candidates' résumés through the Resume Pool. Access is granted strictly for legitimate recruitment and hiring purposes, and only to résumés of candidates who have consented to be included. All candidate data remains protected under our Privacy Policy and Malaysia's Personal Data Protection Act 2010 (as amended). When accessing the Resume Pool you agree that you will NOT:",
    bullets: [
      "Use a candidate's résumé or personal data for any purpose other than evaluating and contacting them about a genuine job opportunity.",
      "Download, screenshot, print, scrape, or otherwise reproduce or extract résumés or candidate data from the platform's viewer.",
      "Redistribute, publish, share, sell, or transfer candidate data to any third party (including other employers or agencies).",
      "Contact candidates for marketing, spam, or any non-recruitment purpose.",
      "Retain candidate data longer than necessary for the relevant hiring decision, or otherwise process it in breach of the PDPA.",
    ],
    note: "Breach of these obligations may result in immediate suspension or termination of your account, forfeiture of subscription fees paid, and may expose you to liability under Malaysian law. TechireX may investigate suspected misuse and report it to the relevant authorities.",
  },
  { id: "payments", label: "6. Payments", title: "6. Payments", body: "Paid plans are billed in Malaysian Ringgit (MYR) and renew automatically unless cancelled. All fees are inclusive of applicable taxes. Refunds are handled per our billing policy." },
  { id: "liability", label: "7. Liability", title: "7. Limitation of liability", body: "TechireX is provided on an 'as is' basis. To the fullest extent permitted under Malaysian law, TechireX shall not be liable for indirect, incidental or consequential damages arising from your use of the platform." },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="border-b border-[#F2EBDF]"
        style={{ background: "linear-gradient(180deg, #FFF7ED 0%, #FFFBF5 100%)" }}>
        <div className="max-w-5xl mx-auto px-10 py-10">
          <p className="text-[12.5px] font-bold text-[#C2410C] uppercase tracking-[0.07em] mb-2.5">Legal</p>
          <h1 className="text-[34px] font-extrabold text-[#1C1C1E] tracking-[-0.03em] mb-2">Terms of Service</h1>
          <p className="text-[14px] text-[#9CA3AF]">Last updated 7 July 2026</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex-1 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-[232px_1fr] bg-[#FCFCFA]">

        {/* Sticky nav — hidden on mobile, shown on desktop */}
        <div className="hidden md:block border-r border-[#F0EEE8] px-5 py-8">
          <div className="sticky top-20">
            <p className="text-[12px] font-bold text-[#9A968C] uppercase tracking-[0.06em] mb-3.5">On this page</p>
            <OnThisPage sections={SECTIONS.map((s) => ({ id: s.id, label: s.label }))} />
          </div>
        </div>

        {/* Body */}
        <div className="px-4 md:px-10 py-6 md:py-9 max-w-[720px]">
          {/* Disclaimer */}
          <div className="bg-[#FFF7ED] rounded-[12px] px-4 py-4 text-[13.5px] text-[#8A5A2B] leading-[1.6] mb-7">
            These Terms of Service are effective as of 7 July 2026. If you have any questions about them, contact us at support@techirex.com.
          </div>

          {SECTIONS.map(s => (
            <div key={s.id} id={s.id} className="mb-7 scroll-mt-24">
              <h2 className="text-[19px] font-extrabold text-[#1C1C1E] tracking-[-0.01em] mb-2.5">{s.title}</h2>
              <p className="text-[15px] leading-[1.75] text-[#3A3A3C] mb-3">{s.body}</p>
              {s.bullets && (
                <div className="flex flex-col gap-2">
                  {s.bullets.map(b => (
                    <div key={b} className="flex gap-3 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] mt-[10px] shrink-0" />
                      <span className="text-[15px] text-[#3A3A3C] leading-[1.6]">{b}</span>
                    </div>
                  ))}
                </div>
              )}
              {s.note && (
                <p className="text-[14px] leading-[1.7] text-[#8A5A2B] bg-[#FFF7ED] rounded-[10px] px-4 py-3 mt-4">{s.note}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Minimal footer strip */}
      <div className="bg-[#1C1C1E] text-white px-10 py-7 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <LogoTile size={28} variant="onDark" />
          <Wordmark className="text-[16px] font-extrabold" />
        </div>
        <div className="flex gap-5 text-[13px]">
          <span className="text-[#F97316] font-bold">Terms</span>
          <Link href="/privacy" className="text-[#9A968C] hover:text-white transition-colors">Privacy</Link>
          <Link href="/contact" className="text-[#9A968C] hover:text-white transition-colors">Contact</Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}

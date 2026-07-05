import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { LogoTile, Wordmark } from "@/components/brand"

export const metadata = { title: "Privacy Policy — StackTalentx", description: "How StackTalentx collects, uses, and protects your personal data in accordance with Malaysia's PDPA 2010." }

const SUMMARY_CARDS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2">
        <path d="M20 7H4C2.9 7 2 7.9 2 9v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" />
        <path d="M16 3H8L6 7h12l-2-4z" />
      </svg>
    ),
    title: "What we collect",
    body: "Name, email, resume, job preferences, and skills when you create a profile. Technical data like IP address and browser type for platform security.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "How we use it",
    body: "To match you with relevant jobs, send application updates, improve the platform, and comply with Malaysian law. We never sell your data.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: "Your rights",
    body: "Under PDPA 2010, you can access, correct, or delete your personal data at any time. Contact us at support@stacktalentx.com to exercise your rights.",
  },
]

const SECTIONS = [
  {
    id: "collect", title: "Information we collect",
    paras: [
      "When you create an account, we collect your name, email address, and role (job seeker or employer). Job seekers may also provide a resume, job preferences, and a list of technical skills.",
      "We automatically collect certain technical data including your IP address, browser type, device type, and pages visited. This data is used solely for platform security and performance monitoring.",
    ],
  },
  {
    id: "use", title: "How we use your information",
    paras: [
      "We use your data to operate and improve StackTalentx: matching job seekers to relevant listings, notifying employers of new applications, and personalising your experience.",
      "We do not sell, rent, or share your personal data with third parties for marketing purposes. We may share data with trusted service providers (cloud hosting, payment processing) who are bound by strict data processing agreements.",
    ],
  },
  {
    id: "retention", title: "Data retention",
    paras: [
      "We retain your account data for as long as your account is active. If you delete your account, we remove your personal data within 30 days, except where retention is required by law.",
    ],
  },
  {
    id: "rights", title: "Your rights under PDPA 2010",
    paras: [
      "Malaysia's Personal Data Protection Act 2010 (PDPA) gives you the right to access, correct, and in some cases withdraw consent to the processing of your personal data.",
      "To exercise any of these rights, contact our Data Protection Officer at support@stacktalentx.com. We will respond within 21 days as required by law.",
    ],
  },
  {
    id: "cookies", title: "Cookies",
    paras: [
      "We use essential cookies to keep you signed in and remember your preferences. We do not use advertising or tracking cookies. You can disable cookies in your browser, but some features may not work correctly.",
    ],
  },
  {
    id: "contact", title: "Contact",
    paras: [
      "If you have questions about this policy or wish to make a complaint, please contact us at support@stacktalentx.com or write to StackTalentx Technologies Sdn Bhd, Kuala Lumpur, Malaysia.",
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="border-b border-[#F2EBDF]"
        style={{ background: "linear-gradient(180deg, #FFF7ED 0%, #FFFBF5 100%)" }}>
        <div className="max-w-5xl mx-auto px-10 py-10">
          <p className="text-[12.5px] font-bold text-[#C2410C] uppercase tracking-[0.07em] mb-2.5">Legal</p>
          <h1 className="text-[34px] font-extrabold text-[#1C1C1E] tracking-[-0.03em] mb-2">Privacy Policy</h1>
          <p className="text-[14px] text-[#9CA3AF]">Last updated 1 June 2026 · Governed by Malaysia's Personal Data Protection Act 2010</p>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-10 py-6 md:py-10">

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 md:mb-10">
          {SUMMARY_CARDS.map(card => (
            <div key={card.title} className="bg-white border border-[#EEEBE3] rounded-[16px] px-5 py-5 shadow-[0_1px_3px_rgba(28,28,30,0.04)]">
              <div className="w-9 h-9 rounded-[10px] bg-[#FFF1E1] flex items-center justify-center mb-3.5">
                {card.icon}
              </div>
              <p className="text-[15px] font-extrabold text-[#1C1C1E] mb-1.5">{card.title}</p>
              <p className="text-[13.5px] text-[#6B7280] leading-[1.6]">{card.body}</p>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="max-w-[720px] flex flex-col gap-6">
          {SECTIONS.map(s => (
            <div key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-[19px] font-extrabold text-[#1C1C1E] tracking-[-0.01em] mb-3">{s.title}</h2>
              {s.paras.map((p, i) => (
                <p key={i} className="text-[15px] leading-[1.75] text-[#3A3A3C] mb-3">{p}</p>
              ))}
            </div>
          ))}
        </div>
      </main>

      {/* Footer strip */}
      <div className="bg-[#1C1C1E] text-white px-10 py-7 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <LogoTile size={28} variant="onDark" />
          <Wordmark className="text-[16px] font-extrabold" />
        </div>
        <div className="flex gap-5 text-[13px]">
          <Link href="/terms" className="text-[#9A968C] hover:text-white transition-colors">Terms</Link>
          <span className="text-[#F97316] font-bold">Privacy</span>
          <Link href="/contact" className="text-[#9A968C] hover:text-white transition-colors">Contact</Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}

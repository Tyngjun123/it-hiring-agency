import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { LogoTile, Wordmark } from "@/components/brand"

export const metadata = { title: "Privacy Policy — StackTalentx", description: "How StackTalentx collects, uses, and protects your personal data under Malaysia's Personal Data Protection Act 2010 (as amended 2024)." }

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
    body: "To match you with relevant jobs, share your résumé with employers you apply to or (if you opt in) with subscribing employers via the Talent Pool, and comply with Malaysian law. We never sell your data to advertisers or data brokers.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: "Your rights",
    body: "Access, correct, port, or delete your data, and withdraw consent (including leaving the Talent Pool) at any time. Contact support@stacktalentx.com to exercise your rights.",
  },
]

const SECTIONS = [
  {
    id: "controller", title: "Who we are",
    paras: [
      "StackTalentx Technologies Sdn Bhd (“StackTalentx”, “we”, “us”) operates the IT recruitment platform at stacktalentx.com and is the data controller of your personal data. This policy explains how we handle personal data under Malaysia’s Personal Data Protection Act 2010, as amended by the Personal Data Protection (Amendment) Act 2024 (“PDPA”).",
    ],
  },
  {
    id: "collect", title: "Information we collect",
    paras: [
      "When you create an account we collect your name, email address, and role (job seeker or employer). Job seekers may also provide a résumé/CV, phone or WhatsApp number, job preferences, technical skills, and social profile links.",
      "If you take part in our referral or payout programmes, we may collect bank details to process payments. We treat these as confidential and use them only for that purpose.",
      "We automatically collect limited technical data (IP address, browser type, device type, and pages visited) used solely for platform security and performance.",
    ],
  },
  {
    id: "use", title: "How we use and share your information",
    paras: [
      "We use your data to operate StackTalentx: matching job seekers to listings, delivering applications to employers, personalising your experience, and complying with Malaysian law.",
      "When you apply to a job, your profile and résumé are shared with that employer so they can consider your application.",
      "We do not sell, rent, or trade your personal data to advertisers or data brokers. Employers pay for platform services and features (such as unlocking résumés you have chosen to make available in the Talent Pool) — this is a service fee for access, not a sale of your data.",
      "We share data with trusted service providers who process it on our behalf under contract (cloud hosting, email delivery, database and storage), and with authorities where required by law.",
    ],
  },
  {
    id: "talent-pool", title: "Talent Pool & employer access to résumés",
    paras: [
      "We offer a “Talent Pool” where verified employers on a paid subscription can discover and unlock job seekers’ résumés, including seekers who have not applied to them.",
      "Your résumé is included in the Talent Pool only if you explicitly opt in. Opting in is optional and separate from applying to jobs — you can use StackTalentx to apply for roles without joining the Talent Pool.",
      "You can withdraw this consent at any time by turning off the Talent Pool toggle in your profile, or by deleting your résumé. Once you opt out, your profile is no longer listed for new unlocks. Employers who previously unlocked or received your résumé through an application may retain the copy they already accessed.",
      "Employers viewing a résumé through the Talent Pool see it as a watermarked, on-screen document tied to their account. Misuse of candidate data by employers is prohibited under our Terms.",
    ],
  },
  {
    id: "transfers", title: "International transfers",
    paras: [
      "Some of our service providers process data on servers outside Malaysia. Where this happens, we take reasonable steps, consistent with the PDPA’s cross-border transfer requirements, to ensure your data receives a comparable level of protection.",
    ],
  },
  {
    id: "retention", title: "Data retention",
    paras: [
      "We keep your account data for as long as your account is active. If you delete your account or résumé, we remove the corresponding personal data within 30 days, except where longer retention is required by law.",
    ],
  },
  {
    id: "security", title: "Data security",
    paras: [
      "Résumés are stored in a private store and served only through short-lived, access-controlled links. We apply reasonable technical and organisational measures to protect personal data against loss, misuse, and unauthorised access.",
    ],
  },
  {
    id: "rights", title: "Your rights under the PDPA",
    paras: [
      "You have the right to access and correct your personal data, withdraw consent to processing (including leaving the Talent Pool), request data portability, and limit or object to certain processing.",
      "To exercise any of these rights, contact our Data Protection Officer at support@stacktalentx.com. We will respond within the timeframe required by law.",
    ],
  },
  {
    id: "breach", title: "Data breach notification",
    paras: [
      "If a personal data breach likely to cause significant harm occurs, we will notify the Personal Data Protection Commissioner and affected individuals as required under the PDPA (Amendment) Act 2024.",
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
      "For any questions or complaints about this policy or your personal data, contact our Data Protection Officer at support@stacktalentx.com, or write to StackTalentx Technologies Sdn Bhd, Kuala Lumpur, Malaysia.",
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
          <p className="text-[14px] text-[#9CA3AF]">Last updated 6 July 2026 · Governed by Malaysia&apos;s Personal Data Protection Act 2010 (as amended by the PDP (Amendment) Act 2024)</p>
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

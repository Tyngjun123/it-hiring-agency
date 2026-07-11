import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import FAQAccordion from "./faq-accordion"
import { getCmsMap } from "@/lib/cms"
import { HELP_FAQS, parseFaqs } from "@/data/faqs"
import { buildPageMetadata, getPageSchema } from "@/lib/seo"
import { RawJsonLd } from "@/components/json-ld"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("help")
}

export default async function HelpPage() {
  const cms = await getCmsMap()
  const faqs = parseFaqs(cms["help_faqs"], HELP_FAQS)
  const helpSchema = await getPageSchema("help")
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <RawJsonLd json={helpSchema} />
      <Navbar />

      {/* Hero + search */}
      <div className="border-b border-[#F2EBDF]"
        style={{ background: "linear-gradient(180deg, #FFF7ED 0%, #FFFBF5 100%)" }}>
        <div className="max-w-4xl mx-auto px-4 py-14 text-center">
          <h1 className="text-[26px] md:text-[44px] font-extrabold text-[#1C1C1E] tracking-[-0.03em] leading-[1.08] mb-3">
            How can we help?
          </h1>
          <p className="text-[16px] text-[#6B7280] mb-7 max-w-md mx-auto leading-relaxed">
            Search our help center or browse the most common questions below.
          </p>

          {/* Search bar — decorative; real search handled by accordion */}
          <div className="flex items-center gap-2.5 bg-white border border-[#EFE7DA] rounded-[14px] px-4 py-1.5 shadow-[0_10px_30px_rgba(28,28,30,0.08)] max-w-[540px] mx-auto">
            <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2.2">
              <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" />
            </svg>
            <span className="flex-1 text-[15px] text-[#A8A49A] text-left py-3">Search for help…</span>
            <Link href="/contact"
              className="bg-[#F97316] hover:bg-[#EA580C] text-white text-[14px] font-bold px-5 py-2.5 rounded-[10px] transition-colors shrink-0">
              Contact us
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12">
        <FAQAccordion faqs={faqs} />

        {/* Still need help */}
        <div className="max-w-[720px] mx-auto mt-10 bg-[#FFF7ED] border border-[#FBDDBE] rounded-[16px] p-7 text-center">
          <h2 className="text-[18px] font-extrabold text-[#1C1C1E] mb-1.5">Still need help?</h2>
          <p className="text-[14px] text-[#6B7280] mb-5">
            Our Kuala Lumpur support team replies within one business day.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/contact"
              className="bg-[#F97316] hover:bg-[#EA580C] text-white text-[14px] font-bold px-6 py-3 rounded-[11px] shadow-[0_6px_15px_rgba(249,115,22,0.3)] transition-colors">
              Contact us
            </Link>
            <a href="mailto:support@techirex.com"
              className="bg-white text-[#C2410C] border-[1.5px] border-[#F7C99A] hover:bg-[#FFF7ED] text-[14px] font-bold px-6 py-3 rounded-[11px] transition-colors">
              Email support
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ContactForm from "./contact-form"

const INFO_CARDS = [
  { icon: "✉", label: "EMAIL", value: "hello@ithire.my", href: "mailto:hello@ithire.my" },
  { icon: "💬", label: "WHATSAPP", value: "Chat on WhatsApp →", href: "https://wa.me/60123456789" },
  { icon: "🕐", label: "HOURS", value: "Mon–Fri, 9am–6pm MYT", href: null },
]

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>
}) {
  const { sent, error } = await searchParams

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        <div className="bg-white border border-[#EAE8E2] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(28,28,30,.04),0_24px_60px_rgba(28,28,30,.08)]">
          <div className="grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr]">

            {/* Left info panel */}
            <div className="p-10 border-b lg:border-b-0 lg:border-r border-[#F2EBDF]"
              style={{ background: "linear-gradient(165deg, #FFF7ED 0%, #FFEEDB 100%)" }}>

              <div className="inline-flex items-center gap-2 bg-white border border-[#FBDDBE] px-3.5 py-1.5 rounded-full text-[12.5px] font-bold text-[#C2410C] mb-5">
                Get in touch
              </div>

              <h1 className="text-[33px] font-extrabold text-[#1C1C1E] tracking-[-0.03em] leading-[1.12] mb-3">
                We&apos;d love to hear from you
              </h1>
              <p className="text-[15px] text-[#7A6A56] leading-relaxed mb-8">
                Questions about posting a job, your account, or partnering with us? Our KL-based team usually replies within one business day.
              </p>

              {/* Info cards */}
              <div className="flex flex-col gap-3.5">
                {INFO_CARDS.map(({ icon, label, value, href }) => (
                  <div key={label} className="flex items-center gap-4 bg-white border border-[#FCE4CB] rounded-[14px] px-4 py-4">
                    <div className="w-[42px] h-[42px] rounded-[12px] bg-[#FFF1E1] flex items-center justify-center text-[18px] shrink-0">
                      {icon}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#9A968C] uppercase tracking-[.05em]">{label}</p>
                      {href ? (
                        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                          className="text-[15px] font-bold text-[#1C1C1E] hover:text-[#F97316] transition-colors mt-0.5 block">
                          {value}
                        </a>
                      ) : (
                        <p className="text-[15px] font-bold text-[#1C1C1E] mt-0.5">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Office */}
              <div className="mt-7 pt-6 border-t border-[#FAD9B8]">
                <p className="text-[13px] font-bold text-[#9A968C] uppercase tracking-[.05em] mb-3">Office</p>
                <p className="text-[14.5px] text-[#3A3A3C] leading-relaxed">
                  Level 12, Menara Tech<br />
                  Jalan Sultan Ismail, 50250<br />
                  Kuala Lumpur, Malaysia
                </p>
              </div>
            </div>

            {/* Right form */}
            <div className="p-10 bg-[#FCFCFA]">
              {sent === "1" ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[#ECFDF5] flex items-center justify-center text-3xl mb-5">✓</div>
                  <h2 className="text-xl font-extrabold text-[#1C1C1E] mb-2">Message sent!</h2>
                  <p className="text-sm text-[#6B7280] max-w-xs leading-relaxed">
                    Thanks for reaching out. We'll get back to you within one business day.
                  </p>
                </div>
              ) : (
                <>
                  {error === "1" && (
                    <div className="mb-5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl px-4 py-3 text-sm text-[#DC2626] font-medium">
                      Please fill in all required fields.
                    </div>
                  )}
                  <ContactForm />
                </>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

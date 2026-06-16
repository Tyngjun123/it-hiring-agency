import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-16 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Contact Us</h1>
          <p className="text-sm text-gray-500 mt-1">We&apos;re here to help. Reach out any time.</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0 text-lg">✉</div>
            <div>
              <p className="text-sm font-medium text-gray-900">Email</p>
              <a href="mailto:tyngjun123@gmail.com" className="text-sm text-blue-600 hover:underline">
                tyngjun123@gmail.com
              </a>
              <p className="text-xs text-gray-400 mt-0.5">We reply within 1 business day</p>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0 text-lg">💬</div>
            <div>
              <p className="text-sm font-medium text-gray-900">WhatsApp</p>
              {/* Replace 601XXXXXXXX with your actual WhatsApp number */}
              <a
                href="https://wa.me/601XXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Chat on WhatsApp →
              </a>
              <p className="text-xs text-gray-400 mt-0.5">Mon – Fri, 9am – 6pm MYT</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-400 text-center">
          IT Hire is a Malaysia-based IT job platform. We connect tech talent with the right companies.
        </p>
      </main>

      <Footer />
    </div>
  )
}

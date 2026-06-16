import Link from "next/link"

const SOCIALS = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/ithire.my",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.437 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12z"/>
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/ithire-my",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    name: "RedNote",
    href: "https://www.xiaohongshu.com/user/profile/placeholder",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm.5 5h2v1.5h-2V7zm-3 0h2v1.5H9.5V7zM17 16.5H7v-1.5h10v1.5zm0-3H7V12h10v1.5zm0-3H7V9h10v1.5z"/>
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/ithire.my",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-[#F0EEE8] bg-white mt-12">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">

          <div className="space-y-3">
            <p className="font-bold text-[#1C1C1E]">Job Seekers</p>
            <ul className="space-y-2 text-[#6B7280]">
              <li><Link href="/" className="hover:text-[#F97316] transition-colors">Browse jobs</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#F97316] transition-colors">My applications</Link></li>
              <li><Link href="/profile" className="hover:text-[#F97316] transition-colors">My profile</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="font-bold text-[#1C1C1E]">Employers</p>
            <ul className="space-y-2 text-[#6B7280]">
              <li><Link href="/register" className="hover:text-[#F97316] transition-colors">Register for free</Link></li>
              <li><Link href="/company/jobs/new" className="hover:text-[#F97316] transition-colors">Post a job</Link></li>
              <li><Link href="/company/jobs" className="hover:text-[#F97316] transition-colors">Manage jobs</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="font-bold text-[#1C1C1E]">Company</p>
            <ul className="space-y-2 text-[#6B7280]">
              <li><Link href="/blog" className="hover:text-[#F97316] transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-[#F97316] transition-colors">Contact us</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="font-bold text-[#1C1C1E]">Follow Us</p>
            <div className="flex flex-wrap gap-3">
              {SOCIALS.map((s) => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                  aria-label={s.name}
                  className="text-[#9CA3AF] hover:text-[#F97316] transition-colors">
                  {s.icon}
                </a>
              ))}
            </div>
            <p className="text-xs text-[#B6B2A8]">
              {SOCIALS.map((s) => s.name).join(" · ")}
            </p>
          </div>

        </div>

        <div className="mt-10 pt-6 border-t border-[#F0EEE8] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[7px] bg-[#F97316] flex items-center justify-center shadow-[0_2px_6px_rgba(249,115,22,0.3)]">
              <span className="text-white font-mono font-bold text-[10px] leading-none">&gt;_</span>
            </div>
            <span className="text-sm font-extrabold text-[#1C1C1E] tracking-tight">IT Hire</span>
          </div>
          <p className="text-xs text-[#B6B2A8]">
            © {new Date().getFullYear()} IT Hire. All rights reserved. · Malaysia
          </p>
        </div>
      </div>
    </footer>
  )
}

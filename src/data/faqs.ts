// Default FAQ content for the Help and Pricing pages. These are the fallback
// values; admins can override them via the Content CMS (stored as JSON in
// cms_content under keys `help_faqs` / `pricing_faqs`).

export type Faq = { category?: string; q: string; a: string }

export const HELP_FAQ_CATEGORIES = ["Candidates", "Employers", "Billing", "Technical"]

export const HELP_FAQS: Faq[] = [
  { category: "Candidates", q: "Is TechireX free for candidates?", a: "Yes — TechireX is completely free for candidates. You can browse all listings, apply to roles, upload your resume and track your application status at no cost, forever." },
  { category: "Candidates", q: "How do I apply for a job?", a: "Click any job listing to view full details, then hit the Apply button. You'll need to be signed in and have a completed profile. Your resume and skills are sent directly to the employer." },
  { category: "Candidates", q: "How do I upload or update my resume?", a: "Go to My Profile → Resume section. You can upload a PDF or Word document (max 5 MB). When you apply to a job, it's shared with that employer for review. If you join the Talent Pool, subscribing employers see it as a protected, watermarked preview." },
  { category: "Candidates", q: "Can I control which employers see my resume?", a: "Yes. Your resume is only shared with an employer when you apply to their job — unless you opt in to the Talent Pool. You can turn the Talent Pool on or off anytime in My Profile → Resume. When it's off, employers can't discover your resume, but you can still apply to jobs directly." },
  { category: "Candidates", q: "How do I track my application status?", a: "Go to the Applications page in your dashboard. Each application shows its current status — Under Review, then Shortlisted or Interviewing as the employer progresses, and finally Hired or Not Selected. You'll get an email when the employer reaches a decision." },
  { category: "Candidates", q: "What types of roles are listed on TechireX?", a: "Every role on TechireX is a technology position — frontend, backend, fullstack, mobile, DevOps, QA, product, and infrastructure roles across Malaysia, including remote and hybrid." },
  { category: "Employers", q: "How do I post a job?", a: "Register or sign in as an employer, complete your Company Profile, then click '+ Post a Job' in the navigation. Your listing goes live immediately after submission." },
  { category: "Employers", q: "What plans are available for employers?", a: "There's a free plan (up to 10 active listings), plus two paid plans: Pro (RM 200/mo — up to 30 job postings, monthly curated IT talent list of 10–20 candidates, active candidate updates) and Max (RM 400/mo — unlimited postings, 50–80 curated talents monthly, priority access to new candidates, talent matching priority queue, 10 boost credits, and a dedicated account manager). See the Pricing page for full details." },
  { category: "Employers", q: "Can I edit a listing after posting?", a: "Yes. Go to Company Dashboard → My Jobs, click the listing, and select Edit. Changes take effect immediately. You can also pause or close a listing at any time." },
  { category: "Employers", q: "How long does a job listing stay active?", a: "Listings stay active for 60 days by default, or until you manually close them. You'll receive an email reminder 7 days before expiry so you can renew if needed." },
  { category: "Employers", q: "Can I search for candidates directly?", a: "Yes. Pro and Max plans can browse the Resume Pool and unlock candidates' résumés directly — Pro includes 50 unlock tokens per month, Max includes 300. Résumés open as protected, watermarked previews. Candidates who applied to your jobs are free to view." },
  { category: "Billing", q: "How much does TechireX cost for employers?", a: "There's a free plan to start. Paid plans are Pro at RM 200/month and Max at RM 400/month, billed monthly in Malaysian Ringgit (MYR) with no long-term commitment." },
  { category: "Billing", q: "What payment methods are accepted?", a: "We currently accept manual bank transfer (Maybank). After paying, send us your reference number and we'll activate your plan within 1 business day. Invoices are issued in MYR." },
  { category: "Billing", q: "Can I cancel or get a refund?", a: "You can cancel your subscription at any time from the Billing page. Your access continues until the end of the current billing period. We do not offer mid-period refunds, but you won't be charged again after cancellation." },
  { category: "Billing", q: "How do I upgrade or downgrade my plan?", a: "Go to Company Dashboard → Billing and select a new plan. Upgrades take effect immediately (with prorated charges). Downgrades apply at the start of your next billing cycle." },
  { category: "Technical", q: "Why can't I log in to my account?", a: "Check that you're using the correct email address. If you signed up with Google, use 'Continue with Google' — not email/password. If you've forgotten your password, use the Forgot password link on the login page." },
  { category: "Technical", q: "Is my personal data secure?", a: "Yes. All data is encrypted in transit (HTTPS) and at rest. We comply with Malaysia's Personal Data Protection Act 2010 (PDPA). We never sell your personal data to third parties." },
  { category: "Technical", q: "What browsers does TechireX support?", a: "TechireX works on all modern browsers — Chrome, Edge, Firefox, and Safari (latest two versions). For the best experience, keep your browser up to date." },
  { category: "Technical", q: "I found a bug or have a feature request. How do I report it?", a: "Use the Contact Us page or email us at support@techirex.com. For urgent issues, include your account email and a brief description of what happened." },
]

export const PRICING_FAQS: Faq[] = [
  { q: "How do I pay?", a: "We currently accept manual bank transfer (Maybank). Contact us after payment with your reference number and we'll activate your plan within 1 business day." },
  { q: "Can I cancel anytime?", a: "Yes. Pro and Max run month-to-month with no lock-in. Contact us before your next billing date to cancel." },
  { q: "What happens when I hit the listing limit?", a: "Your existing listings stay active. On Free you just can't post new ones until you upgrade or close a listing; Pro covers up to 30 postings/month and Max is unlimited." },
  { q: "Is the Boost add-on separate from my plan?", a: "Yes. Any company can buy a Boost for an individual listing at RM 100 / 30 days. The Max plan also includes 10 boost credits every month." },
]

// Parse a CMS JSON string of FAQs, falling back to defaults if missing/invalid.
export function parseFaqs(json: string | undefined | null, fallback: Faq[]): Faq[] {
  if (!json) return fallback
  try {
    const parsed = JSON.parse(json)
    if (Array.isArray(parsed) && parsed.every((x) => x && typeof x.q === "string" && typeof x.a === "string")) {
      return parsed as Faq[]
    }
  } catch {
    /* fall through */
  }
  return fallback
}

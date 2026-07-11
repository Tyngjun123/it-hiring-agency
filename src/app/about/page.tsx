export const revalidate = 3600

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getCmsMap } from "@/lib/cms"
import { buildPageMetadata, getPageSchema } from "@/lib/seo"
import { RawJsonLd } from "@/components/json-ld"
import type { Metadata } from "next"
import {
  ABOUT_VALUES_DEFAULT, ABOUT_TEAM_DEFAULT, TEAM_COLORS, parseList,
  ABOUT_MISSION_HEADING_DEFAULT, ABOUT_JOIN_HEADING_DEFAULT, ABOUT_JOIN_BODY_DEFAULT,
  type Value, type Member,
} from "@/data/about"

// Fallbacks match the live copy so the page is unchanged until edited in the CMS.
const ABOUT_TAGLINE = "The job board Malaysia's tech industry deserved."
const ABOUT_HERO = "TechireX is a focused job platform built exclusively for Malaysian IT professionals and the companies that hire them. No noise. No middlemen. Just great tech jobs."
const ABOUT_BODY =
  "<p>The hiring process for tech talent in Malaysia was broken. Candidates wasted hours on generic boards full of spam. Employers paid expensive agencies and still got mismatched candidates. TechireX was built to fix that.</p>" +
  "<p>We're a team of Malaysian developers and operators who got frustrated with the status quo. So we built the platform we always wanted — focused exclusively on IT, with transparent salaries, a clean application flow, and zero middlemen.</p>" +
  "<p>Every product decision we make is guided by one question: does this help a Malaysian developer find a great job faster, or help a Malaysian tech team find the right person faster?</p>"

async function getStats() {
  const [companies, jobs] = await Promise.all([
    prisma.companyProfile.count(),
    prisma.jobListing.count({ where: { status: "ACTIVE" } }),
  ])
  return { companies, jobs }
}


export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("about")
}

export default async function AboutPage() {
  const { companies, jobs } = await getStats()
  const cms = await getCmsMap()
  const aboutSchema = await getPageSchema("about")
  const aboutTagline = cms["about_tagline"] ?? ABOUT_TAGLINE
  const aboutHero = cms["about_hero"] ?? ABOUT_HERO
  const aboutBody = cms["about_body"] ?? ABOUT_BODY
  const aboutMissionHeading = cms["about_mission_heading"] ?? ABOUT_MISSION_HEADING_DEFAULT
  const aboutJoinHeading = cms["about_join_heading"] ?? ABOUT_JOIN_HEADING_DEFAULT
  const aboutJoinBody = cms["about_join_body"] ?? ABOUT_JOIN_BODY_DEFAULT
  const values = parseList<Value>(cms["about_values"], ABOUT_VALUES_DEFAULT, (x) => !!x && typeof (x as Value).title === "string")
  const team = parseList<Member>(cms["about_team"], ABOUT_TEAM_DEFAULT, (x) => !!x && typeof (x as Member).name === "string")

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <RawJsonLd json={aboutSchema} />
      <Navbar />

      {/* Hero */}
      <div className="border-b border-[#F2EBDF]"
        style={{ background: "linear-gradient(165deg, #FFF7ED 0%, #FFEEDB 60%, #FFFBF5 100%)" }}>
        <div className="max-w-4xl mx-auto px-4 py-10 md:py-16 text-center space-y-5">
          <div className="inline-flex items-center gap-2 bg-white border border-[#FBDDBE] px-4 py-1.5 rounded-full text-[12.5px] font-bold text-[#C2410C]">
            About TechireX
          </div>
          <h1 className="text-[28px] md:text-[42px] lg:text-[52px] font-extrabold text-[#1C1C1E] tracking-[-0.03em] leading-[1.08]">
            {aboutTagline}
          </h1>
          <p className="text-[17px] text-[#7A6A56] leading-relaxed max-w-xl mx-auto">
            {aboutHero}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/"
              className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-[15px] px-7 py-3.5 rounded-[12px] shadow-[0_8px_18px_rgba(249,115,22,0.3)] transition-colors">
              Browse jobs
            </Link>
            <Link href="/contact"
              className="border border-[#E6E2D9] bg-white text-[#1C1C1E] font-bold text-[15px] px-7 py-3.5 rounded-[12px] hover:border-[#F97316] hover:text-[#F97316] transition-colors">
              Get in touch
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-14 space-y-14">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: `${jobs}+`, label: "Active job listings" },
            { value: `${companies}+`, label: "Companies hiring" },
            { value: "100%", label: "IT-focused roles" },
            { value: "Free", label: "For candidates" },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white border border-[#EEEBE3] rounded-2xl p-6 text-center shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
              <p className="text-[30px] font-extrabold text-[#F97316] tracking-tight">{value}</p>
              <p className="text-[13px] text-[#6B7280] font-medium mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="bg-white border border-[#EEEBE3] rounded-2xl p-8 md:p-10 shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
          <p className="text-[11px] font-bold text-[#F97316] uppercase tracking-[.08em] mb-3">Our mission</p>
          <h2 className="text-[26px] font-extrabold text-[#1C1C1E] tracking-tight leading-[1.2] mb-5">
            {aboutMissionHeading}
          </h2>
          <div className="space-y-4 text-[15px] text-[#4B5563] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: aboutBody }} />
        </div>

        {/* Values */}
        <div>
          <p className="text-[11px] font-bold text-[#F97316] uppercase tracking-[.08em] mb-2">What we stand for</p>
          <h2 className="text-[24px] font-extrabold text-[#1C1C1E] tracking-tight mb-8">Our values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {values.map(({ icon, title, body }) => (
              <div key={title} className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="text-[16px] font-extrabold text-[#1C1C1E] mb-2">{title}</h3>
                <p className="text-[14px] text-[#6B7280] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div>
          <p className="text-[11px] font-bold text-[#F97316] uppercase tracking-[.08em] mb-2">The people</p>
          <h2 className="text-[24px] font-extrabold text-[#1C1C1E] tracking-tight mb-8">Who we are</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {team.map(({ name, role, initials }, ti) => (
              <div key={ti} className="bg-white border border-[#EEEBE3] rounded-2xl p-6 text-center shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl font-extrabold"
                  style={{ background: TEAM_COLORS[ti % TEAM_COLORS.length].bg, color: TEAM_COLORS[ti % TEAM_COLORS.length].fg }}>
                  {initials}
                </div>
                <p className="text-[16px] font-extrabold text-[#1C1C1E]">{name}</p>
                <p className="text-[13px] text-[#9CA3AF] mt-1">{role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-10 text-center border border-[#FBDDBE]"
          style={{ background: "linear-gradient(120deg, #FFF7ED, #FFEAD3)" }}>
          <h2 className="text-[26px] font-extrabold text-[#1C1C1E] tracking-tight mb-3">
            {aboutJoinHeading}
          </h2>
          <p className="text-[15px] text-[#7A6A56] mb-7 max-w-md mx-auto leading-relaxed">
            {aboutJoinBody}
          </p>
          <div className="flex items-center justify-center">
            <Link href="/contact"
              className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-[15px] px-7 py-3.5 rounded-[12px] shadow-[0_8px_18px_rgba(249,115,22,0.3)] transition-colors">
              Get in touch →
            </Link>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  )
}

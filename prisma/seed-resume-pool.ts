// Dev seed for testing the Resume Pool: a PRO company + two seekers with real
// sample résumé PDFs uploaded to Supabase. Run: npx tsx prisma/seed-resume-pool.ts
import * as dotenv from "dotenv"
dotenv.config()

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as never)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
const RESUME_BUCKET = "resumes"

// Build a tiny but valid one-page PDF from text lines (ASCII only).
function buildPdf(lines: string[]): Buffer {
  const objs: string[] = []
  objs.push("<</Type/Catalog/Pages 2 0 R>>")
  objs.push("<</Type/Pages/Kids[3 0 R]/Count 1>>")
  objs.push("<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>")
  objs.push("<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>")
  let content = "BT /F1 20 Tf 72 720 Td 26 TL\n"
  for (const line of lines) content += `(${line.replace(/([()\\])/g, "\\$1")}) Tj T*\n`
  content += "ET"
  objs.push(`<</Length ${content.length}>>\nstream\n${content}\nendstream`)

  let body = "%PDF-1.4\n"
  const offsets: number[] = []
  objs.forEach((o, i) => {
    offsets.push(Buffer.byteLength(body, "latin1"))
    body += `${i + 1} 0 obj\n${o}\nendobj\n`
  })
  const xrefStart = Buffer.byteLength(body, "latin1")
  let xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`
  for (const off of offsets) xref += `${String(off).padStart(10, "0")} 00000 n \n`
  const trailer = `trailer\n<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF`
  return Buffer.from(body + xref + trailer, "latin1")
}

async function upload(path: string, pdf: Buffer) {
  const { error } = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(path, pdf, { contentType: "application/pdf", upsert: true })
  if (error) throw new Error(`Upload ${path} failed: ${error.message}`)
  return path
}

async function main() {
  const passwordHash = await bcrypt.hash("Test1234!", 10)

  // ── PRO company (the viewer) ────────────────────────────────────────────────
  const companyUser = await prisma.user.upsert({
    where: { email: "resumepool-tester@example.com" },
    update: { role: "COMPANY", passwordHash },
    create: { email: "resumepool-tester@example.com", name: "Resume Pool Tester", passwordHash, role: "COMPANY" },
  })
  const company = await prisma.companyProfile.upsert({
    where: { userId: companyUser.id },
    update: { plan: "PRO", resumeTokens: 50, resumeTokensRefreshedAt: new Date(), billingStart: new Date() },
    create: {
      userId: companyUser.id,
      companyName: "TEST — Resume Pool Co",
      contactEmail: "resumepool-tester@example.com",
      plan: "PRO",
      resumeTokens: 50,
      resumeTokensRefreshedAt: new Date(),
      billingStart: new Date(),
    },
  })

  // ── Two seekers with real sample résumés ────────────────────────────────────
  const seekers = [
    {
      email: "test-seeker-alpha@example.com",
      name: "TEST Seeker Alpha",
      path: "seed-pool/alpha.pdf",
      pdf: ["TEST RESUME — Alpha Tan", "Senior Backend Developer", "", "Skills: Python, Django, PostgreSQL", "Experience: 6 years", "KL, Malaysia"],
      skills: [{ language: "Python", yearsExp: 6 }, { language: "PostgreSQL", yearsExp: 4 }, { language: "Docker", yearsExp: 3 }],
      preUnlock: true,
    },
    {
      email: "test-seeker-beta@example.com",
      name: "TEST Seeker Beta",
      path: "seed-pool/beta.pdf",
      pdf: ["TEST RESUME — Beta Lim", "Frontend Engineer", "", "Skills: React, TypeScript, Next.js", "Experience: 3 years", "Penang, Malaysia"],
      skills: [{ language: "React", yearsExp: 3 }, { language: "TypeScript", yearsExp: 3 }, { language: "Next.js", yearsExp: 2 }],
      preUnlock: false,
    },
  ]

  for (const s of seekers) {
    await upload(s.path, buildPdf(s.pdf))
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: { role: "INTERVIEWEE", name: s.name },
      create: { email: s.email, name: s.name, role: "INTERVIEWEE" },
    })
    const profile = await prisma.intervieweeProfile.upsert({
      where: { userId: user.id },
      update: { resumeUrl: s.path, onboardedAt: new Date() },
      create: { userId: user.id, resumeUrl: s.path, onboardedAt: new Date() },
    })
    await prisma.techSkill.deleteMany({ where: { profileId: profile.id } })
    await prisma.techSkill.createMany({ data: s.skills.map((sk) => ({ ...sk, profileId: profile.id })) })

    if (s.preUnlock) {
      await prisma.unlockedResume.upsert({
        where: { companyProfileId_intervieweeId: { companyProfileId: company.id, intervieweeId: profile.id } },
        update: {},
        create: { companyProfileId: company.id, intervieweeId: profile.id, costTokens: 0 },
      })
    }
  }

  console.log("✓ Resume Pool test data ready.")
  console.log("  Company login: resumepool-tester@example.com / Test1234!  (PRO, 50 tokens)")
  console.log("  Alpha = pre-unlocked (View résumé works immediately)")
  console.log("  Beta  = locked (test the Unlock + confirmation flow)")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

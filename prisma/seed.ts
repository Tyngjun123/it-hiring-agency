import * as dotenv from "dotenv"
dotenv.config()

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as never)

async function main() {
  console.log("Seeding dummy data...")

  // Create a test company user
  const passwordHash = await bcrypt.hash("password123", 10)

  const companyUser = await prisma.user.upsert({
    where: { email: "demo@techcorp.my" },
    update: {},
    create: {
      email: "demo@techcorp.my",
      name: "TechCorp Demo",
      passwordHash,
      role: "COMPANY",
    },
  })

  const company = await prisma.companyProfile.upsert({
    where: { userId: companyUser.id },
    update: {},
    create: {
      userId: companyUser.id,
      companyName: "TechCorp Malaysia",
      contactEmail: "hr@techcorp.my",
      description: "A leading Malaysian software house building enterprise solutions since 2010.",
      website: "https://techcorp.my",
      plan: "PRO",
    },
  })

  // Second company
  const company2User = await prisma.user.upsert({
    where: { email: "demo@startupkl.my" },
    update: {},
    create: {
      email: "demo@startupkl.my",
      name: "StartupKL",
      passwordHash,
      role: "COMPANY",
    },
  })

  const company2 = await prisma.companyProfile.upsert({
    where: { userId: company2User.id },
    update: {},
    create: {
      userId: company2User.id,
      companyName: "StartupKL",
      contactEmail: "careers@startupkl.my",
      description: "Fast-growing fintech startup disrupting payments in Southeast Asia.",
      website: "https://startupkl.my",
      plan: "FREE",
    },
  })

  const jobs = [
    {
      companyId: company.id,
      title: "Senior Backend Developer (Python / Django)",
      location: "Kuala Lumpur",
      workType: "REMOTE" as const,
      payType: "MONTHLY" as const,
      payRangeFrom: 8000,
      payRangeTo: 12000,
      description: `We are looking for a Senior Backend Developer to join our growing engineering team.

Responsibilities:
- Design, build and maintain high-performance REST APIs using Python/Django
- Collaborate with frontend engineers to integrate user-facing elements
- Write clean, scalable, well-tested code
- Participate in code reviews and architectural discussions

Requirements:
- 4+ years of Python/Django experience
- Strong understanding of PostgreSQL and Redis
- Experience with Docker and CI/CD pipelines
- Familiarity with AWS or GCP is a plus`,
      sellingPoint1: "100% remote, work from anywhere in Malaysia",
      sellingPoint2: "13-month salary + annual performance bonus",
      sellingPoint3: "Full medical & dental coverage",
      status: "ACTIVE" as const,
      hideCompanyInfo: false,
    },
    {
      companyId: company.id,
      title: "React Frontend Developer",
      location: "Penang",
      workType: "HYBRID" as const,
      payType: "MONTHLY" as const,
      payRangeFrom: 5000,
      payRangeTo: 8000,
      description: `Join our frontend team to build beautiful, performant web applications.

Responsibilities:
- Build responsive UI components using React and TypeScript
- Collaborate with UX designers to implement pixel-perfect interfaces
- Optimise applications for speed and scalability

Requirements:
- 2+ years of React experience
- Proficiency in TypeScript
- Familiarity with state management (Zustand, Redux)
- Experience with REST API integration`,
      sellingPoint1: "Flexible hybrid — 2 days WFH per week",
      sellingPoint2: "RM 500/month transport & WiFi allowance",
      sellingPoint3: "Annual training budget RM 2,000",
      status: "ACTIVE" as const,
      hideCompanyInfo: false,
    },
    {
      companyId: company.id,
      title: "DevOps / Cloud Engineer",
      location: "Kuala Lumpur",
      workType: "ONSITE" as const,
      payType: "MONTHLY" as const,
      payRangeFrom: 9000,
      payRangeTo: 14000,
      description: `We need a DevOps engineer to own our cloud infrastructure and deployment pipelines.

Responsibilities:
- Manage AWS infrastructure using Terraform
- Build and maintain CI/CD pipelines (GitHub Actions, Jenkins)
- Monitor system health, set up alerting and incident response
- Drive adoption of DevOps best practices across engineering teams

Requirements:
- 3+ years in DevOps or SRE roles
- Hands-on experience with AWS (ECS, RDS, Lambda, CloudWatch)
- Strong scripting skills (Bash, Python)
- Kubernetes knowledge is a strong plus`,
      sellingPoint1: "AWS certification sponsorship",
      sellingPoint2: "Work directly with CTO on infrastructure roadmap",
      sellingPoint3: "Competitive salary reviewed annually",
      status: "ACTIVE" as const,
      hideCompanyInfo: false,
    },
    {
      companyId: company2.id,
      title: "QA Engineer (Manual + Automation)",
      location: "Petaling Jaya, Selangor",
      workType: "ONSITE" as const,
      payType: "MONTHLY" as const,
      payRangeFrom: 4000,
      payRangeTo: 6500,
      description: `We're looking for a QA Engineer to ensure the quality of our fintech platform.

Responsibilities:
- Create and execute test plans, test cases, and test scripts
- Perform functional, regression, and performance testing
- Build automation test suites using Playwright or Selenium
- Report and track bugs using JIRA

Requirements:
- 2+ years in QA/testing roles
- Experience with automation frameworks (Playwright preferred)
- Understanding of Agile/Scrum methodology
- API testing experience (Postman)`,
      sellingPoint1: "Young & dynamic team environment",
      sellingPoint2: "Fast career growth — promote from within",
      sellingPoint3: "Free lunch on Fridays",
      status: "ACTIVE" as const,
      hideCompanyInfo: false,
    },
    {
      companyId: company2.id,
      title: "IT Project Manager",
      location: "Kuala Lumpur",
      workType: "HYBRID" as const,
      payType: "MONTHLY" as const,
      payRangeFrom: 8000,
      payRangeTo: 12000,
      description: `Lead cross-functional teams to deliver our payment platform features on time.

Responsibilities:
- Define project scope, goals and deliverables
- Manage project timelines, budgets and stakeholder communication
- Coordinate between engineering, design and business teams
- Run Agile ceremonies: sprint planning, standups, retrospectives

Requirements:
- 5+ years in IT project management
- PMP or PRINCE2 certification is a plus
- Experience with Jira, Confluence
- Strong communication skills in English and Bahasa Malaysia`,
      sellingPoint1: "Equity option scheme for all PMs",
      sellingPoint2: "Lead projects with regional impact (MY, SG, TH)",
      sellingPoint3: "Flexible hours — no micromanagement",
      status: "ACTIVE" as const,
      hideCompanyInfo: false,
    },
    {
      companyId: company.id,
      title: "Full Stack Developer (Node.js + Vue.js)",
      location: "Kuala Lumpur",
      workType: "REMOTE" as const,
      payType: "MONTHLY" as const,
      payRangeFrom: 6000,
      payRangeTo: 10000,
      description: `Build end-to-end features for our enterprise SaaS platform.

Responsibilities:
- Develop RESTful APIs using Node.js (Express/Fastify)
- Build dynamic frontends using Vue.js 3 and Nuxt
- Manage PostgreSQL and MongoDB databases
- Write unit and integration tests

Requirements:
- 3+ years of full-stack experience
- Proficiency in Node.js and Vue.js
- Database design and query optimisation skills
- Experience with Git and code review workflows`,
      sellingPoint1: "100% remote — we are async-first",
      sellingPoint2: "Home office setup allowance RM 1,500",
      sellingPoint3: "Mental health benefits included",
      status: "ACTIVE" as const,
      hideCompanyInfo: false,
    },
    {
      companyId: company2.id,
      title: "Business Analyst (IT / Fintech)",
      location: "Kuala Lumpur",
      workType: "HYBRID" as const,
      payType: "MONTHLY" as const,
      payRangeFrom: 5000,
      payRangeTo: 8000,
      description: `Bridge the gap between business needs and technical solutions.

Responsibilities:
- Gather and document business requirements from stakeholders
- Translate requirements into detailed functional specifications
- Work with engineering to ensure features are built to spec
- Conduct UAT and produce business process flow diagrams

Requirements:
- 3+ years as a Business Analyst in tech companies
- Strong knowledge of BPMN and UML
- Experience in payments or financial services industry
- Proficiency with Confluence, JIRA, Miro`,
      sellingPoint1: "Directly shape our product roadmap",
      sellingPoint2: "Annual conference and training budget",
      sellingPoint3: "Hybrid 3 days office / 2 days WFH",
      status: "ACTIVE" as const,
      hideCompanyInfo: false,
    },
    {
      companyId: company.id,
      title: "Infrastructure Engineer (Windows & Linux)",
      location: "Johor Bahru",
      workType: "ONSITE" as const,
      payType: "MONTHLY" as const,
      payRangeFrom: 5500,
      payRangeTo: 9000,
      description: `Maintain and evolve our on-premise and hybrid cloud infrastructure.

Responsibilities:
- Manage Windows Server, Active Directory, and VMware environments
- Administer Linux servers (Ubuntu, CentOS)
- Handle network configuration, firewalls and VPNs
- Perform regular backups, disaster recovery tests and security patching

Requirements:
- 3+ years in IT infrastructure or sysadmin roles
- Experience with VMware vSphere and Hyper-V
- Networking fundamentals (TCP/IP, VLANs, BGP)
- MCSA or RHCSA certification is a plus`,
      sellingPoint1: "Relocation assistance provided",
      sellingPoint2: "On-call allowance up to RM 800/month",
      sellingPoint3: "Company housing subsidy for Johor staff",
      status: "ACTIVE" as const,
      hideCompanyInfo: false,
    },
  ]

  for (const job of jobs) {
    await prisma.jobListing.create({ data: job })
  }

  console.log(`✓ Created 2 companies and ${jobs.length} job listings.`)
  console.log("  Company login: demo@techcorp.my / password123")
  console.log("  Company login: demo@startupkl.my / password123")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

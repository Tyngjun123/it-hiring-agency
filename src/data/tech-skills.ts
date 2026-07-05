export const TECH_SKILL_CATEGORIES: Record<string, string[]> = {
  "Frontend": [
    "React", "Next.js", "Vue.js", "Nuxt.js", "Angular", "Svelte",
    "TypeScript", "JavaScript", "HTML/CSS", "Tailwind CSS",
  ],
  "Backend": [
    "Node.js", "NestJS", "Express.js", "Python", "Django", "FastAPI",
    "Java", "Spring Boot", "PHP", "Laravel", "C#", ".NET",
    "Go", "Ruby on Rails",
  ],
  "Mobile": [
    "React Native", "Flutter", "Swift", "Kotlin", "Android", "iOS", "Xamarin",
  ],
  "Database": [
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite",
    "Firebase", "Supabase", "Oracle DB", "MS SQL Server",
  ],
  "DevOps & Cloud": [
    "Docker", "Kubernetes", "AWS", "Azure", "GCP",
    "Linux", "Terraform", "GitHub Actions", "Jenkins", "Nginx", "CI/CD",
  ],
  "Testing & QA": [
    "Playwright", "Cypress", "Selenium", "Jest", "Pytest", "Postman", "JMeter",
  ],
  "Tools & Practices": [
    "Git", "GraphQL", "REST API", "Microservices", "Kafka",
    "Agile/Scrum", "Jira", "Figma",
  ],
  "Industry / Domain": [
    "Banking & Finance", "Fintech", "Insurance", "CRM / Customer Management",
    "Software House", "E-commerce & Retail", "Telco / Telecommunications",
    "Healthcare & Medtech", "Government / GLC", "Logistics & Supply Chain",
    "Education & EdTech", "Property & Real Estate", "Manufacturing",
    "Management Consulting", "Media & Entertainment", "Startup / Product",
  ],
}

export const YEAR_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// Human-readable labels for the job-preference role types (set during onboarding).
export const JOB_TYPE_LABELS: Record<string, string> = {
  PROJECT_COORDINATOR: "Project Coordinator",
  BUSINESS_ANALYST: "Business Analyst",
  QUALITY_ASSURANCE: "Quality Assurance",
  PROJECT_MANAGER: "Project Manager",
  APPLICATION_SYSTEM_SUPPORT: "App System Support",
  INFRASTRUCTURE: "Infrastructure",
  BACKEND_DEVELOPER: "Backend Developer",
  FRONTEND_DEVELOPER: "Frontend Developer",
  FULLSTACK_DEVELOPER: "Fullstack Developer",
  EXPLORING: "Still Exploring",
}

// Which skill categories are relevant to each job type.
// Used to collapse/hide unrelated skills on the onboarding Skills step.
// An empty array (or "EXPLORING") means "show all categories".
export const JOB_TYPE_SKILL_CATEGORIES: Record<string, string[]> = {
  FRONTEND_DEVELOPER: ["Frontend", "Mobile", "Tools & Practices"],
  BACKEND_DEVELOPER: ["Backend", "Database", "DevOps & Cloud", "Tools & Practices"],
  FULLSTACK_DEVELOPER: ["Frontend", "Backend", "Mobile", "Database", "DevOps & Cloud", "Tools & Practices"],
  QUALITY_ASSURANCE: ["Testing & QA", "Database", "Tools & Practices"],
  INFRASTRUCTURE: ["DevOps & Cloud", "Database", "Tools & Practices"],
  APPLICATION_SYSTEM_SUPPORT: ["Database", "DevOps & Cloud", "Tools & Practices"],
  BUSINESS_ANALYST: ["Database", "Tools & Practices"],
  PROJECT_MANAGER: ["Tools & Practices"],
  PROJECT_COORDINATOR: ["Tools & Practices"],
  EXPLORING: [], // show all
}

// "Industry / Domain" is relevant to everyone, always shown.
export const ALWAYS_SHOWN_CATEGORIES = ["Industry / Domain"]

// Given a list of selected job types, returns the category names to show.
// Returns null when everything should be shown (no prefs / EXPLORING).
export function relevantCategoriesFor(jobTypes: string[]): string[] | null {
  if (jobTypes.length === 0 || jobTypes.includes("EXPLORING")) return null
  const set = new Set<string>()
  for (const jt of jobTypes) {
    const cats = JOB_TYPE_SKILL_CATEGORIES[jt]
    if (!cats || cats.length === 0) return null // unknown/exploring → show all
    cats.forEach((c) => set.add(c))
  }
  ALWAYS_SHOWN_CATEGORIES.forEach((c) => set.add(c))
  return Array.from(set)
}

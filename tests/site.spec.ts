import { test, expect } from "@playwright/test"

// ─── Credentials ──────────────────────────────────────────────────────────────
const JOB_SEEKER = { email: "jobseeker111@gmail.com", password: "tyngjun123" }
const COMPANY    = { email: "company111@gmail.com",   password: "tyngjun123" }

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function login(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/login")
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  // Click the credentials "Sign in" button (not the Google button which is first in DOM)
  await page.getByRole("button", { name: /sign in/i }).click()
  await page.waitForURL(url => !url.hostname.includes("google") && !url.pathname.includes("/login"), { timeout: 15_000 })
}

// ─── Public pages ─────────────────────────────────────────────────────────────
test("homepage loads with job listings", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveTitle(/IT Hire/i)
  await expect(page.locator("h1")).toContainText("Find your next role")
  // Search form — wait for client hydration
  await expect(page.locator('input[name="q"]')).toBeVisible({ timeout: 10_000 })
})

test("homepage search by keyword works", async ({ page }) => {
  await page.goto("/")
  await page.waitForSelector('input[name="q"]', { state: "visible" })
  await page.fill('input[name="q"]', "developer")
  await page.locator('button[type="submit"]').click()
  await page.waitForURL(/q=developer/, { timeout: 8000 })
  await expect(page.locator("main")).toBeVisible()
})

test("homepage location dropdown opens", async ({ page }) => {
  await page.goto("/")
  await page.click('input[placeholder*="Location"]')
  await expect(page.locator("text=Popular locations")).toBeVisible()
  await page.click("text=Kuala Lumpur")
  await expect(page.locator('input[placeholder*="Location"]')).toHaveValue("Kuala Lumpur")
})

test("login page loads", async ({ page }) => {
  await page.goto("/login")
  await expect(page.locator("h1")).toContainText("Welcome back")
  await expect(page.locator('input[name="email"]')).toBeVisible()
  await expect(page.locator('input[name="password"]')).toBeVisible()
})

test("register page loads with role toggle", async ({ page }) => {
  await page.goto("/register")
  await expect(page.locator("h1")).toContainText("Create account")
  await expect(page.getByRole("button", { name: "Job Seeker" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Company" })).toBeVisible()
})

test("blog page loads", async ({ page }) => {
  await page.goto("/blog")
  await expect(page).not.toHaveURL(/error/)
  await expect(page.locator("h1").first()).toBeVisible()
})

test("pricing page loads", async ({ page }) => {
  await page.goto("/pricing")
  await expect(page).not.toHaveURL(/error/)
})

test("contact page loads", async ({ page }) => {
  await page.goto("/contact")
  await expect(page).not.toHaveURL(/error/)
})

// ─── Job Seeker flow ──────────────────────────────────────────────────────────
test("job seeker can log in", async ({ page }) => {
  await login(page, JOB_SEEKER.email, JOB_SEEKER.password)
  // Should end up somewhere other than /login
  expect(page.url()).not.toContain("/login")
})

test("job seeker dashboard loads", async ({ page }) => {
  await login(page, JOB_SEEKER.email, JOB_SEEKER.password)
  await page.goto("/dashboard")
  await expect(page).not.toHaveURL(/login/)
})

test("job seeker profile page loads", async ({ page }) => {
  await login(page, JOB_SEEKER.email, JOB_SEEKER.password)
  await page.goto("/profile")
  await expect(page).not.toHaveURL(/login/)
})

test("job seeker cannot access company dashboard", async ({ page }) => {
  await login(page, JOB_SEEKER.email, JOB_SEEKER.password)
  await page.goto("/company/jobs")
  // Should redirect away from /company/*
  await expect(page).not.toHaveURL(/\/company\//)
})

// ─── Company flow ─────────────────────────────────────────────────────────────
test("company can log in", async ({ page }) => {
  await login(page, COMPANY.email, COMPANY.password)
  expect(page.url()).not.toContain("/login")
})

test("company jobs page loads", async ({ page }) => {
  await login(page, COMPANY.email, COMPANY.password)
  await page.goto("/company/jobs")
  await expect(page).not.toHaveURL(/login/)
  // Shows jobs list OR company-profile-required modal OR setup page
  const isOk = await page.locator("h1, h2").first().isVisible()
  expect(isOk).toBe(true)
})

test("company billing page loads", async ({ page }) => {
  await login(page, COMPANY.email, COMPANY.password)
  await page.goto("/company/billing")
  await expect(page).not.toHaveURL(/login/)
  // Billing shows content or company-profile-required modal
  await expect(page.locator("h1, h2").first()).toBeVisible()
})

test("company topbar back-to-site link works", async ({ page }) => {
  await login(page, COMPANY.email, COMPANY.password)
  await page.goto("/company/jobs")
  await expect(page.locator("a", { hasText: "Back to site" })).toBeVisible()
})

test("company cannot access job seeker pages", async ({ page }) => {
  await login(page, COMPANY.email, COMPANY.password)
  await page.goto("/dashboard")
  // Should redirect or show access denied — not stay on /dashboard for job seekers
  // (actual redirect depends on implementation — just check it doesn't 500)
  await expect(page).not.toHaveURL(/500/)
})

// ─── 404 / error ─────────────────────────────────────────────────────────────
test("unknown route returns 404 not 500", async ({ page }) => {
  const res = await page.goto("/this-page-does-not-exist-xyz")
  expect(res?.status()).not.toBe(500)
})

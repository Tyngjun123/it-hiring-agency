"use server"

import { signIn } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@/generated/prisma/enums"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { z } from "zod"

const RegisterSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(["INTERVIEWEE", "COMPANY"]),
})

export async function signUpWithEmail(formData: FormData) {
  const parsed = RegisterSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  })

  if (!parsed.success) {
    return { error: "Invalid input. Please check your details." }
  }

  const { email, password, role } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: "An account with this email already exists." }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: role as Role,
      name: email.split("@")[0],
    },
  })

  // Auto sign-in after registration, then route by role via /auth/redirect
  // (COMPANY → /company/setup, INTERVIEWEE → / with onboarding).
  try {
    await signIn("credentials", { email, password, redirectTo: "/auth/redirect" })
  } catch (error: unknown) {
    if ((error as { message?: string })?.message?.includes("NEXT_REDIRECT")) throw error
    // Account created but auto sign-in failed — fall back to the login popup.
    redirect("/?auth=login&registered=1")
  }
}

export async function signInWithCredentials(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) return { error: "Email and password are required." }

  try {
    await signIn("credentials", { email, password, redirectTo: "/auth/redirect" })
  } catch (error: unknown) {
    if ((error as { message?: string })?.message?.includes("NEXT_REDIRECT")) throw error
    return { error: "Invalid email or password." }
  }
}

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/auth/redirect" })
}

// ─── Password reset (OTP) ────────────────────────────────────────────────────

import { sendPasswordResetCode } from "@/lib/emails"

export async function requestPasswordReset(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase()
  if (!email) return { error: "Please enter your email." }

  const user = await prisma.user.findUnique({ where: { email } })

  // Only generate + send if the account exists and uses password login.
  // Always return success to avoid leaking which emails are registered.
  if (user?.passwordHash) {
    const code = String(Math.floor(100000 + Math.random() * 900000)) // 6-digit
    const codeHash = await bcrypt.hash(code, 10)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Invalidate previous codes for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } })
    await prisma.passwordResetToken.create({ data: { email, codeHash, expiresAt } })

    try {
      await sendPasswordResetCode({ to: email, code })
    } catch {
      // swallow — don't reveal delivery state
    }
  }

  return { ok: true }
}

export async function resetPassword(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const code = (formData.get("code") as string)?.trim()
  const password = formData.get("password") as string
  const confirm = formData.get("confirm") as string

  if (!email || !code || !password) return { error: "All fields are required." }
  if (password.length < 8) return { error: "Password must be at least 8 characters." }
  if (password !== confirm) return { error: "Passwords do not match." }

  const token = await prisma.passwordResetToken.findFirst({
    where: { email, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  })
  if (!token) return { error: "Code expired or invalid. Please request a new one." }

  const valid = await bcrypt.compare(code, token.codeHash)
  if (!valid) return { error: "Incorrect code. Please try again." }

  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.update({ where: { email }, data: { passwordHash } })
  await prisma.passwordResetToken.update({ where: { id: token.id }, data: { used: true } })

  return { ok: true }
}

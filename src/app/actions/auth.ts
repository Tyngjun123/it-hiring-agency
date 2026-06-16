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

  redirect("/login?registered=1")
}

export async function signInWithCredentials(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) return { error: "Email and password are required." }

  try {
    await signIn("credentials", { email, password, redirectTo: "/onboarding/preferences" })
  } catch (error: unknown) {
    if ((error as { message?: string })?.message?.includes("NEXT_REDIRECT")) throw error
    return { error: "Invalid email or password." }
  }
}

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/onboarding/preferences" })
}

import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { ADMIN_USERNAMES } from "@/lib/admin"
import type { Role } from "@/generated/prisma/enums"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Admin shortcut: a known admin username + ADMIN_PASSWORD env var.
        // No fallback — if ADMIN_PASSWORD is unset, the admin shortcut is disabled.
        const adminPassword = process.env.ADMIN_PASSWORD
        const username = (credentials.email as string).trim().toLowerCase()
        const adminEmail = ADMIN_USERNAMES[username]
        if (adminEmail && adminPassword) {
          const matches = await bcrypt.compare(
            credentials.password as string,
            // Support either a bcrypt hash or a plaintext value in the env var
            adminPassword.startsWith("$2") ? adminPassword : await bcrypt.hash(adminPassword, 10)
          )
          if (!matches) return null

          let adminUser = await prisma.user.findUnique({ where: { email: adminEmail } })
          if (!adminUser) {
            adminUser = await prisma.user.create({
              data: { email: adminEmail, name: username === "admin" ? "Admin" : username },
            })
          }
          return adminUser
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.passwordHash) return null

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!passwordMatch) return null

        return user
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: Role | null }).role
      }
      // Refresh role from DB when session is explicitly updated (e.g. after setUserRole)
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub! },
          select: { role: true },
        })
        if (dbUser) token.role = dbUser.role
      }
      return token
    },
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
        session.user.role = token.role as Role | null
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/onboarding/role",
  },
})

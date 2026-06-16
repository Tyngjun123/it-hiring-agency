import { Role } from "@/generated/prisma/enums"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role?: Role | null
    }
  }

  interface User {
    role?: Role | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role | null
  }
}

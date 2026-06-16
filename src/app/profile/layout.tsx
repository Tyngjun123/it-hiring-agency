import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.role !== "INTERVIEWEE") redirect("/")
  return <>{children}</>
}

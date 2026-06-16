import { auth } from "@/auth"
import { redirect } from "next/navigation"

const ADMIN_EMAILS = ["tyngjun123@gmail.com"]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    redirect("/")
  }
  return <>{children}</>
}

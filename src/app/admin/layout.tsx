import { auth } from "@/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { isAdminEmail } from "@/lib/admin"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") ?? ""

  // Allow the login page without auth check
  if (pathname === "/admin/login") return <>{children}</>

  const session = await auth()
  if (!isAdminEmail(session?.user?.email)) {
    redirect("/admin/login")
  }
  return <>{children}</>
}

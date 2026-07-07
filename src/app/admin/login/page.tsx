import { auth, signIn } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { isAdminEmail } from "@/lib/admin"
import { LogoTile } from "@/components/brand"

async function adminLoginAction(formData: FormData) {
  "use server"
  try {
    await signIn("credentials", {
      email: formData.get("username") as string,
      password: formData.get("password") as string,
      redirectTo: "/admin",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/admin/login?error=1")
    }
    throw error
  }
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await auth()
  if (isAdminEmail(session?.user?.email)) {
    redirect("/admin")
  }

  const { error } = await searchParams

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-[#EEEBE3] rounded-2xl shadow-[0_2px_8px_rgba(28,28,30,0.06)] p-8">
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <LogoTile size={56} variant="onDark" />
          </div>

          <h1 className="text-center text-[22px] font-extrabold text-[#1C1C1E] mb-1">
            Admin Sign In
          </h1>
          <p className="text-center text-[13.5px] text-[#9CA3AF] mb-6">
            TechireX — restricted access
          </p>

          <form action={adminLoginAction} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#4B5563] mb-1.5">
                Username
              </label>
              <input
                name="username"
                type="text"
                autoComplete="username"
                required
                placeholder="admin"
                className="w-full border border-[#E6E2D9] rounded-xl px-3.5 py-2.5 text-sm text-[#1C1C1E] placeholder:text-[#C4BFB5] focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4B5563] mb-1.5">
                Password
              </label>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full border border-[#E6E2D9] rounded-xl px-3.5 py-2.5 text-sm text-[#1C1C1E] placeholder:text-[#C4BFB5] focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
              />
            </div>

            {error && (
              <p className="text-xs font-semibold text-red-500 text-center">
                Invalid username or password.
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-sm py-2.5 rounded-xl shadow-[0_4px_10px_rgba(249,115,22,0.3)] transition-colors mt-1"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

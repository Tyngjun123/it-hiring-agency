import { Suspense } from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-4 py-10">
      <div className="w-full max-w-[900px]">
        <Suspense>{children}</Suspense>
      </div>
    </div>
  )
}

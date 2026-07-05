"use client"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster richColors position="top-center" toastOptions={{ duration: 3000 }} />
    </SessionProvider>
  )
}

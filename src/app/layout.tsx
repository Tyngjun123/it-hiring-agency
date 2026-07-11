import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import Providers from "@/components/providers";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { getSiteConfig } from "@/lib/site-config";
import { isAdminEmail } from "@/lib/admin";
import { getSiteUrl } from "@/lib/site-url";
import MaintenancePage from "./maintenance/page";
import AuthModal from "@/components/auth/auth-modal";
import ToastBridge from "@/components/toast-bridge";
import FloatingWhatsApp from "@/components/floating-whatsapp";
import { JsonLd } from "@/components/json-ld";
import { Suspense } from "react";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "TechireX — Find IT Jobs in Malaysia",
  description: "The niche job platform for IT professionals in Malaysia.",
};

const BYPASS_PREFIXES = ["/admin", "/api", "/auth", "/maintenance", "/login", "/register"]

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") ?? ""
  const bypass = BYPASS_PREFIXES.some((p) => pathname.startsWith(p))

  let showMaintenance = false
  let waHref: string | null = null
  let siteSchema: Record<string, unknown>[] | null = null

  if (!bypass) {
    try {
      const config = await getSiteConfig()
      if (config?.maintenanceMode) {
        const session = await auth()
        if (!isAdminEmail(session?.user?.email)) showMaintenance = true
      }
      const waNumber = config?.contactPhone?.replace(/[^\d]/g, "")
      if (waNumber) waHref = `https://wa.me/${waNumber}`

      // Site-wide structured data (Organization + WebSite) for search engines.
      const siteUrl = getSiteUrl()
      const sameAs = [
        config?.facebookUrl,
        config?.instagramUrl,
        config?.linkedinUrl,
        config?.twitterUrl,
      ].filter((u): u is string => !!u)
      siteSchema = [
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "TechireX",
          url: siteUrl,
          logo: config?.logoUrl || `${siteUrl}/icon.png`,
          ...(sameAs.length ? { sameAs } : {}),
        },
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "TechireX",
          url: siteUrl,
        },
      ]
    } catch {
      // If DB is unavailable, don't block the page
    }
  }

  // Floating WhatsApp on public pages only — keep it off the employer portal
  // (its mobile bottom nav would overlap the button).
  const showFloatingWa =
    !showMaintenance && waHref !== null && !pathname.startsWith("/company")

  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {siteSchema && !showMaintenance && <JsonLd data={siteSchema} />}
        <Providers>{showMaintenance ? <MaintenancePage /> : children}</Providers>
        {!showMaintenance && (
          <Suspense fallback={null}>
            <AuthModal />
          </Suspense>
        )}
        <Suspense fallback={null}>
          <ToastBridge />
        </Suspense>
        {showFloatingWa && waHref && <FloatingWhatsApp href={waHref} />}
      </body>
    </html>
  );
}

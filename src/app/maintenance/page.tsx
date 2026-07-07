import { LogoTile } from "@/components/brand"

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-7 w-fit"><LogoTile size={64} variant="onDark" /></div>
        <h1 className="text-[30px] font-extrabold text-[#1C1C1E] tracking-tight mb-3">
          We&#39;ll be right back
        </h1>
        <p className="text-[16px] text-[#6B7280] leading-relaxed mb-8">
          TechireX is undergoing scheduled maintenance. We&#39;ll be back online shortly. Sorry for the inconvenience.
        </p>
        <p className="text-sm text-[#9CA3AF]">
          Questions? Email us at{" "}
          <a href="mailto:support@stacktalentx.com" className="text-[#F97316] font-semibold hover:underline">
            support@stacktalentx.com
          </a>
        </p>
      </div>
    </div>
  )
}

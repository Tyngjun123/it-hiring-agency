export const dynamic = "force-dynamic"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/navbar"
import NotificationIcon from "@/components/notification-icon"
import { markAllNotificationsRead } from "@/app/actions/notifications"

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hour${h !== 1 ? "s" : ""} ago`
  const d = Math.floor(h / 24)
  if (d === 1) return "yesterday"
  if (d < 7) return `${d} days ago`
  return date.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })
}

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const items = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
  const hasUnread = items.some((n) => !n.read)

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-[22px] font-extrabold text-[#1C1C1E] tracking-tight">Notifications</h1>
          {hasUnread && (
            <form action={markAllNotificationsRead}>
              <button type="submit" className="text-[13px] font-bold text-[#F97316] hover:text-[#EA580C]">
                Mark all read
              </button>
            </form>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-[#EEEBE3] rounded-2xl py-16 text-center shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
            <p className="text-[16px] font-extrabold text-[#1C1C1E]">You&apos;re all caught up!</p>
            <p className="text-[13px] text-[#9CA3AF] mt-1.5">No notifications yet. We&apos;ll ping you when something happens.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#EEEBE3] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)] divide-y divide-[#F2F0EA]">
            {items.map((n) => (
              <Link
                key={n.id}
                href={n.link}
                className={`flex gap-3 px-4 py-4 transition-colors hover:bg-[#FBFAF6] ${
                  n.read ? "border-l-[3px] border-transparent" : "bg-[#FFFBF5] border-l-[3px] border-[#F97316]"
                }`}
              >
                <NotificationIcon type={n.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-[#1C1C1E] leading-[1.5]">
                    <span className="font-bold">{n.title}</span>
                    {n.body ? ` — ${n.body}` : ""}
                  </p>
                  <p className="text-[11.5px] text-[#9CA3AF] mt-1.5">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-[#F97316] shrink-0 mt-1.5" />}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

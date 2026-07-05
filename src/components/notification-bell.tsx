"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { markNotificationRead, markAllNotificationsRead } from "@/app/actions/notifications"
import NotificationIcon from "@/components/notification-icon"

export type BellItem = {
  id: string
  type: string
  title: string
  body: string
  link: string
  read: boolean
  createdAt: string // ISO
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hour${h !== 1 ? "s" : ""} ago`
  const d = Math.floor(h / 24)
  if (d === 1) return "yesterday"
  if (d < 7) return `${d} days ago`
  return new Date(iso).toLocaleDateString("en-MY", { day: "numeric", month: "short" })
}

export default function NotificationBell({ initialUnread, items }: { initialUnread: number; items: BellItem[] }) {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(initialUnread)
  const [list, setList] = useState(items)
  const [, start] = useTransition()
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !(ref.current as HTMLDivElement).contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  function openItem(item: BellItem) {
    setOpen(false)
    if (!item.read) {
      setList((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)))
      setUnread((u) => Math.max(0, u - 1))
      start(() => { markNotificationRead(item.id) })
    }
    router.push(item.link)
  }

  function markAll() {
    setList((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnread(0)
    start(() => { markAllNotificationsRead() })
  }

  const hasUnread = unread > 0

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className={`relative w-10 h-10 rounded-[11px] flex items-center justify-center border transition-colors ${
          hasUnread
            ? "bg-[#FFF1E1] border-[#F7C99A] text-[#C2410C]"
            : "bg-[#F6F4EE] border-transparent text-[#6B7280] hover:text-[#1C1C1E]"
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {hasUnread && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F97316] text-white text-[11px] font-extrabold flex items-center justify-center border-2 border-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[360px] bg-white border border-[#EEEBE3] rounded-[18px] overflow-hidden shadow-[0_1px_2px_rgba(28,28,30,.04),0_18px_44px_rgba(28,28,30,.14)] z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-[18px] py-4 border-b border-[#F2F0EA]">
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-extrabold text-[#1C1C1E]">Notifications</span>
              {hasUnread && (
                <span className="bg-[#F97316] text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full">{unread} new</span>
              )}
            </div>
            {hasUnread && (
              <button type="button" onClick={markAll} className="text-[12.5px] font-bold text-[#F97316] hover:text-[#EA580C]">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[386px] overflow-y-auto">
            {list.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-[15px] font-extrabold text-[#1C1C1E]">You&apos;re all caught up!</p>
                <p className="text-[12.5px] text-[#9CA3AF] mt-1.5">No notifications yet. We&apos;ll ping you when something happens.</p>
              </div>
            ) : (
              list.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => openItem(n)}
                  className={`w-full flex gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#FBFAF6] ${
                    n.read ? "border-l-[3px] border-transparent" : "bg-[#FFFBF5] border-l-[3px] border-[#F97316]"
                  }`}
                >
                  <NotificationIcon type={n.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] text-[#1C1C1E] leading-[1.5]">
                      <span className="font-bold">{n.title}</span>
                      {n.body ? ` — ${n.body}` : ""}
                    </p>
                    <p className="text-[11.5px] text-[#9CA3AF] mt-1.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-[#F97316] shrink-0 mt-1.5" />}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block text-center py-3 border-t border-[#F2F0EA] text-[13px] font-bold text-[#F97316] bg-[#FCFCFA] hover:bg-[#F8F6F1] transition-colors"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  )
}

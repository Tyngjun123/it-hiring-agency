"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteBlogPost } from "@/app/actions/cms"

export default function DeletePostButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()

  function handleDelete() {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    start(async () => {
      await deleteBlogPost(id)
      toast.success("Post deleted")
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="text-xs font-bold text-[#DC2626] hover:text-[#B91C1C] disabled:opacity-50 transition-colors"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  )
}

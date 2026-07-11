"use client"

import { useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { createImageUploadUrl } from "@/app/actions/cms"

export default function ImageUploader({
  name,
  defaultValue,
}: {
  name: string
  defaultValue?: string | null
}) {
  const [url, setUrl] = useState(defaultValue ?? "")
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.")
      return
    }
    setError("")
    setUploading(true)
    const ext = file.name.split(".").pop() ?? "jpg"
    const signed = await createImageUploadUrl(ext)
    if ("error" in signed) {
      setError(signed.error)
      setUploading(false)
      return
    }
    const { error: uploadError } = await supabase.storage
      .from("images")
      .uploadToSignedUrl(signed.path, signed.token, file)
    if (uploadError) {
      setError("Upload failed. Please try again.")
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from("images").getPublicUrl(signed.path)
    setUrl(data.publicUrl)
    setUploading(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  return (
    <div className="space-y-2">
      {/* Hidden input carries the URL into the server action form */}
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="relative rounded-[11px] overflow-hidden border border-[#E6E2D9]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Cover preview" className="w-full h-44 object-contain bg-[#F6F4EE]" />
          <button
            type="button"
            onClick={() => setUrl("")}
            className="absolute top-2 right-2 bg-white border border-[#E6E2D9] rounded-lg px-2.5 py-1 text-xs font-bold text-[#6B7280] hover:text-red-500 transition-colors shadow-sm"
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-[11px] p-8 text-center cursor-pointer transition-colors select-none ${
            dragging
              ? "border-[#F97316] bg-[#FFF7ED]"
              : "border-[#E6E2D9] hover:border-[#F97316] hover:bg-[#FAFAF8]"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) uploadFile(f)
            }}
          />
          {uploading ? (
            <p className="text-sm text-[#F97316] font-semibold">Uploading…</p>
          ) : (
            <>
              <div className="text-3xl mb-2">🖼️</div>
              <p className="text-sm font-semibold text-[#6B7280]">Drag & drop or click to upload</p>
              <p className="text-xs text-[#9CA3AF] mt-1">PNG, JPG, WebP · Best at 1200×630px · shown in full, never cropped</p>
            </>
          )}
        </div>
      )}

      <input
        type="url"
        placeholder="Or paste an image URL…"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full border border-[#E6E2D9] rounded-[11px] px-3.5 py-2 text-sm text-[#1C1C1E] placeholder:text-[#C4BFB5] focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
      />

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}

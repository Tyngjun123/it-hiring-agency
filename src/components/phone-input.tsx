"use client"

import { useState } from "react"

// Phone input that only accepts digits and a leading "+" (for country code).
export default function PhoneInput({
  name,
  defaultValue,
  placeholder,
  className,
}: {
  name: string
  defaultValue?: string
  placeholder?: string
  className?: string
}) {
  const [value, setValue] = useState(defaultValue ?? "")
  return (
    <input
      name={name}
      type="tel"
      inputMode="numeric"
      value={value}
      placeholder={placeholder}
      onChange={(e) => setValue(e.target.value.replace(/[^0-9+]/g, ""))}
      className={className}
    />
  )
}

import { useEffect } from "react"

// Locks background page scroll while a modal/overlay is open.
export function useLockBodyScroll(locked: boolean = true) {
  useEffect(() => {
    if (!locked) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = original }
  }, [locked])
}

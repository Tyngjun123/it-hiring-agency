"use client"

import { useState } from "react"

export const DEFAULT_BLOG_COVER = "/blog-default-cover.svg"

/**
 * Renders a blog cover image and falls back to a branded default image
 * if the real cover URL is broken or fails to load.
 */
export default function BlogCover({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  const [imgSrc, setImgSrc] = useState(src)

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (imgSrc !== DEFAULT_BLOG_COVER) setImgSrc(DEFAULT_BLOG_COVER)
      }}
    />
  )
}

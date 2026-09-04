"use client"

import Image from "next/image"
import { useRef } from "react"

type GalleryImage = { id: string; url: string }

export default function ProductGallery({
  images,
  alt,
  activeIndex,
  onSelect,
}: {
  images: GalleryImage[]
  alt: string
  activeIndex: number
  onSelect: (index: number) => void
}) {
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([])
  const active = images[activeIndex] ?? images[0]

  function go(delta: number) {
    const next = (activeIndex + delta + images.length) % images.length
    onSelect(next)
    thumbRefs.current[next]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden bg-surface">
        {active && (
          <Image
            key={active.id}
            src={active.url}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className="object-cover"
          />
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-bg/80 text-lg hover:bg-bg"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-bg/80 text-lg hover:bg-bg"
            >
              ›
            </button>
            <span className="absolute bottom-3 right-3 bg-bg/80 px-2 py-0.5 text-xs text-muted">
              {activeIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              ref={(el) => {
                thumbRefs.current[i] = el
              }}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === activeIndex}
              className={`relative h-16 w-16 shrink-0 overflow-hidden bg-surface ${
                i === activeIndex ? "ring-2 ring-ink" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

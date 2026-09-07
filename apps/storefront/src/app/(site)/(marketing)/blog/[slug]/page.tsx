import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getBlogPostBySlug, urlForImage } from "@/lib/sanity"
import { ScrollReveal } from "@/lib/motion-variants"
import RichText from "@/components/RichText"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) return {}
  return {
    title: `${post.title} | HaydenGoSeek`,
    description: post.excerpt ?? undefined,
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) notFound()

  return (
    <article className="mx-auto max-w-3xl px-4 py-24 sm:px-8 md:py-32">
      <Link href="/blog" className="text-xs font-medium uppercase tracking-[0.08em] text-muted hover:text-ink">
        &larr; Journal
      </Link>

      <ScrollReveal>
        <p className="mt-8 text-xs font-medium uppercase tracking-[0.08em] text-muted">
          {formatDate(post.publishedAt)}
          {post.author ? ` — ${post.author}` : ""}
        </p>
        <h1 className="font-serif mt-4 text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.1] tracking-[-0.02em] text-ink">
          {post.title}
        </h1>
      </ScrollReveal>

      {post.coverImage && (
        <div className="relative mt-10 aspect-[16/9] overflow-hidden bg-surface">
          <Image
            src={urlForImage(post.coverImage).width(1600).url()}
            alt={post.title}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      <RichText value={post.body} fallback={[]} className="mt-10 text-lg leading-relaxed tracking-[-0.01em] text-ink" />
    </article>
  )
}

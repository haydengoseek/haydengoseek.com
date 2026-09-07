import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { getBlogPosts, urlForImage } from "@/lib/sanity"
import { ScrollReveal, StaggerGroup } from "@/lib/motion-variants"

export const metadata: Metadata = {
  title: "Blog | HaydenGoSeek",
  description: "Notes on art, music and process from Hayden Andrews.",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })
}

export default async function BlogIndexPage() {
  const posts = await getBlogPosts()

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-24 sm:px-8 md:py-32">
      <ScrollReveal className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">Journal</p>
        <h1 className="font-serif mt-6 text-[clamp(2rem,5vw,4.25rem)] leading-[1.05] tracking-[-0.02em] text-ink">
          From the studio
        </h1>
      </ScrollReveal>

      {posts.length === 0 ? (
        <p className="mt-16 text-sm text-muted">No posts yet — check back soon.</p>
      ) : (
        <StaggerGroup className="mt-16 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                {post.coverImage && (
                  <Image
                    src={urlForImage(post.coverImage).width(900).height(675).url()}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                  />
                )}
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.08em] text-muted">{formatDate(post.publishedAt)}</p>
              <h2 className="font-serif mt-2 text-xl leading-snug tracking-[-0.01em] text-ink">{post.title}</h2>
              {post.excerpt && <p className="mt-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>}
            </Link>
          ))}
        </StaggerGroup>
      )}
    </div>
  )
}

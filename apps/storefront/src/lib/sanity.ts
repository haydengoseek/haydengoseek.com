import { createClient } from "@sanity/client"
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url"
import type { PortableTextBlock } from "@portabletext/types"

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ""
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production"

// No Sanity project configured yet (e.g. fresh local checkout before setup) — every
// getter below returns null, so the site still boots without one.
export const sanityClient = PROJECT_ID
  ? createClient({
      projectId: PROJECT_ID,
      dataset: DATASET,
      apiVersion: "2024-01-01",
      useCdn: true,
    })
  : null

const imageBuilder = sanityClient ? createImageUrlBuilder(sanityClient) : null
export function urlForImage(source: SanityImageSource) {
  if (!imageBuilder) throw new Error("Sanity is not configured (NEXT_PUBLIC_SANITY_PROJECT_ID missing)")
  return imageBuilder.image(source).auto("format")
}

export type SanityCta = { label: string; url: string } | null

export type SanityHomePage = {
  hero: {
    eyebrow: string | null
    zoomHeading: string | null
    revealLabel: string | null
    revealStatement: string | null
    cta: SanityCta
    backdropImage: SanityImageSource | null
    insetRevealImage: SanityImageSource | null
    closingImage: SanityImageSource | null
    scrollLabel: string | null
    sectionLabel: string | null
  } | null
  artworksCarousel: { eyebrow: string | null; heading: string | null } | null
  teamSlider: { eyebrow: string | null } | null
  faqSection: { heading: string | null; showSection: boolean } | null
  contactSection: {
    eyebrow: string | null
    headingLines: string[] | null
    note: string | null
    directEmail: string | null
    studioAddress: string | null
  } | null
}

export async function getHomePage() {
  if (!sanityClient) return null
  return sanityClient.fetch<SanityHomePage | null>(
    `*[_type == "homePage"][0]{
      hero, artworksCarousel, teamSlider, faqSection, contactSection
    }`,
    {},
    { next: { revalidate: 60 } }
  )
}

export type SanityArtwork = {
  title: string
  medusaHandle: string
  medium: string | null
  story: PortableTextBlock[] | null
  gallery: SanityImageSource[] | null
}

export async function getArtworkByHandle(handle: string) {
  if (!sanityClient) return null
  return sanityClient.fetch<SanityArtwork | null>(
    `*[_type == "artwork" && medusaHandle == $handle][0]{ title, medusaHandle, medium, story, gallery }`,
    { handle },
    { next: { revalidate: 60 } }
  )
}

export type SanityFaqItem = { question: string; answer: PortableTextBlock[] }

export async function getFaqItems() {
  if (!sanityClient) return []
  return sanityClient.fetch<SanityFaqItem[]>(
    `*[_type == "faqItem"] | order(order asc) { question, answer }`,
    {},
    { next: { revalidate: 60 } }
  )
}

export type SanityArtistBio = {
  name: string | null
  role: string | null
  portrait: SanityImageSource | null
  bio: PortableTextBlock[] | null
}

export async function getArtistBio() {
  if (!sanityClient) return null
  return sanityClient.fetch<SanityArtistBio | null>(
    `*[_type == "artistBio"][0]{ name, role, portrait, bio }`,
    {},
    { next: { revalidate: 60 } }
  )
}

export type SanitySiteSettings = {
  title: string | null
  announcementText: string | null
  navLinks: { label: string; href: string }[] | null
  contactEmail: string | null
  contactPhone: string | null
  address: string | null
  socialLinks: { platform: string; url: string }[] | null
  footerColumns: { heading: string; links: { label: string; href: string }[] }[] | null
  newsletterHeading: string | null
  newsletterBody: string | null
  newsletterPlaceholder: string | null
  copyrightName: string | null
}

export async function getSiteSettings() {
  if (!sanityClient) return null
  return sanityClient.fetch<SanitySiteSettings | null>(
    `*[_type == "siteSettings"][0]{
      title, announcementText, navLinks, contactEmail, contactPhone, address,
      socialLinks, footerColumns, newsletterHeading, newsletterBody,
      newsletterPlaceholder, copyrightName
    }`,
    {},
    { next: { revalidate: 60 } }
  )
}

export type SanityGenericPage = {
  title: string
  heroImage: SanityImageSource | null
  body: PortableTextBlock[] | null
}

export async function getPageBySlug(slug: string) {
  if (!sanityClient) return null
  return sanityClient.fetch<SanityGenericPage | null>(
    `*[_type == "page" && slug.current == $slug][0]{ title, heroImage, body }`,
    { slug },
    { next: { revalidate: 60 } }
  )
}

export type SanityBlogPostSummary = {
  title: string
  slug: string
  coverImage: SanityImageSource | null
  excerpt: string | null
  publishedAt: string
}

export async function getBlogPosts() {
  if (!sanityClient) return []
  return sanityClient.fetch<SanityBlogPostSummary[]>(
    `*[_type == "blogPost"] | order(publishedAt desc) {
      title, "slug": slug.current, coverImage, excerpt, publishedAt
    }`,
    {},
    { next: { revalidate: 60 } }
  )
}

export type SanityBlogPost = SanityBlogPostSummary & {
  author: string | null
  body: PortableTextBlock[]
}

export async function getBlogPostBySlug(slug: string) {
  if (!sanityClient) return null
  return sanityClient.fetch<SanityBlogPost | null>(
    `*[_type == "blogPost" && slug.current == $slug][0]{
      title, "slug": slug.current, coverImage, excerpt, publishedAt, author, body
    }`,
    { slug },
    { next: { revalidate: 60 } }
  )
}

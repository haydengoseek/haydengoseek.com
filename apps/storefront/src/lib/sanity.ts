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

export type SanityCollectionTeaser = {
  title: string
  description: string | null
  image: SanityImageSource | null
  medusaCategoryHandle: string | null
}

export type SanityHomePage = {
  heading: string
  subheading: string | null
  heroImage: SanityImageSource | null
  primaryCta: SanityCta
  collectionTeasers: SanityCollectionTeaser[] | null
  introHeading: string | null
  introBody: PortableTextBlock[] | null
  showFaqSection: boolean
}

export async function getHomePage() {
  if (!sanityClient) return null
  return sanityClient.fetch<SanityHomePage | null>(
    `*[_type == "homePage"][0]{
      heading, subheading, heroImage, primaryCta, collectionTeasers,
      introHeading, introBody, showFaqSection
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
  tagline: string | null
  portrait: SanityImageSource | null
  bio: PortableTextBlock[] | null
}

export async function getArtistBio() {
  if (!sanityClient) return null
  return sanityClient.fetch<SanityArtistBio | null>(
    `*[_type == "artistBio"][0]{ name, tagline, portrait, bio }`,
    {},
    { next: { revalidate: 60 } }
  )
}

export type SanitySiteSettings = {
  title: string | null
  logo: SanityImageSource | null
  logoReverse: SanityImageSource | null
  navLinks: { label: string; href: string }[] | null
  contactEmail: string | null
  contactPhone: string | null
  address: string | null
  footerText: string | null
}

export async function getSiteSettings() {
  if (!sanityClient) return null
  return sanityClient.fetch<SanitySiteSettings | null>(
    `*[_type == "siteSettings"][0]{
      title, logo, logoReverse, navLinks, contactEmail, contactPhone, address, footerText
    }`,
    {},
    { next: { revalidate: 60 } }
  )
}

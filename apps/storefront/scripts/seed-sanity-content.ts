// One-off content seed: populates Sanity with the site's real, currently-live
// copy so Studio opens already looking like the live site instead of blank
// fields, and so the code's FALLBACK_* constants and the CMS agree on day one.
// Run with: npx sanity exec scripts/seed-sanity-content.ts --with-user-token
import { getCliClient } from "sanity/cli"

const client = getCliClient({ apiVersion: "2024-01-01" })

function block(text: string) {
  return {
    _type: "block",
    _key: crypto.randomUUID(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: crypto.randomUUID(), text, marks: [] }],
  }
}

const FAQS: { question: string; answer: string }[] = [
  {
    question: "Are your artworks original?",
    answer:
      "Yes. My original artworks are one-of-a-kind, hand-created pieces. Once an original has sold, it will be marked as sold and won't be available again.",
  },
  {
    question: "Do you offer fine art prints?",
    answer:
      "Yes. Every print is produced using museum-quality archival inks on premium materials to ensure exceptional colour, detail and longevity.",
  },
  {
    question: "Do you offer canvas prints?",
    answer:
      "Yes. My canvas prints are produced using archival inks on premium artist canvas before being professionally hand-stretched over timber stretcher bars.",
  },
  {
    question: "Are your prints limited edition?",
    answer:
      "Some collections are released as limited editions while others remain open editions. If a print is limited edition it will be clearly noted on the product page.",
  },
  {
    question: "Can I choose my size?",
    answer:
      "Absolutely. We have sizes carefully selected to suit the proportions of the original artwork, but if you want a custom size we can accommodate that request.",
  },
  {
    question: "Can I have my artwork framed?",
    answer:
      "Yes. You can order your artwork unframed or choose from professionally handcrafted frames in oak, black or white. Every frame is custom made in my Gold Coast studio.",
  },
  {
    question: "What kind of glass do you use?",
    answer:
      "Our framed paper prints are available with premium acrylic (or standard glazing, local only) depending on the size and product selected. Artglass or anti-reflective acrylic are available on request at an extra cost (minimal reflection).",
  },
  {
    question: "How long will my order take?",
    answer:
      "Most print orders are produced within 7–10 business days. Framed orders generally take 2–3 weeks as each frame is custom made by hand.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes. We ship throughout Australia and to many countries worldwide. Shipping costs are calculated at checkout.",
  },
  {
    question: "How is my artwork packaged?",
    answer:
      "Every artwork is carefully packaged to ensure it arrives safely. Prints are shipped flat or rolled depending on size, while framed works are professionally protected using heavy-duty packaging.",
  },
  {
    question: "Can I commission a custom artwork?",
    answer:
      "Yes. I occasionally accept commission work. If you're interested in a custom piece, please get in touch through the Contact page to discuss your ideas.",
  },
  {
    question: "What if my artwork arrives damaged?",
    answer:
      "Although every order is packaged with great care, if your artwork arrives damaged please contact me within 48 hours and include photographs of both the artwork and packaging so I can arrange a replacement or solution.",
  },
  {
    question: "Can I return my order?",
    answer:
      "Because each print and frame is made to order, change-of-mind returns aren't accepted. However, if your order arrives damaged or there's a manufacturing issue, I'll make it right.",
  },
  {
    question: "Who creates the framing?",
    answer:
      "Every frame is handcrafted in my own professional framing workshop on the Gold Coast. I've spent over 18 years framing artwork, so every piece is made with the same level of care I'd use for my own collection.",
  },
  {
    question: "Will the colours look exactly the same as on my screen?",
    answer:
      "Every effort is made to accurately represent the artwork, however colours can vary slightly between different computer monitors, phones and tablets.",
  },
  {
    question: "How do I care for my artwork?",
    answer:
      "Keep your artwork out of direct sunlight and avoid areas with excessive humidity. Dust frames gently with a soft cloth and avoid using cleaning products directly on the artwork.",
  },
  {
    question: "Do you sign your prints?",
    answer: "Yes. Where applicable, prints are individually signed, and limited editions are also numbered.",
  },
]

const ARTIST_BIO_PARAGRAPH =
  "Hayden Andrews, known artistically as HaydenGoSeek, is a Gold Coast-based artist, musician, songwriter and educator whose work is inspired by connection, storytelling and the beauty found in everyday life. Having written more than 800 songs, toured internationally and had music featured in film, television and advertising, Hayden brings the same creative depth to his visual art. He also teaches songwriting at HOTA and the Queensland Creative Academy. What makes his work unique is that he personally creates, scans, prints and frames his own artworks, offering collectors a rare opportunity to purchase pieces that have been crafted entirely under the vision and care of the original artist."

async function run() {
  console.log("Seeding homePage…")
  await client.createOrReplace({
    _id: "homePage-singleton",
    _type: "homePage",
    hero: {
      _type: "object",
      eyebrow: "Gold Coast, Australia",
      zoomHeading: "Original artworks and museum-quality fine art prints by Hayden Andrews.",
      revealLabel: "About Hayden",
      revealStatement:
        "Explore original artworks, museum-quality fine art prints and handcrafted framing, all created under one roof. Inspired by a lifetime of music, creativity and storytelling, each piece is professionally scanned, printed and framed by Hayden himself, ensuring every artwork is presented exactly as intended from the first brushstroke to the finished piece on your wall.",
      cta: { _type: "cta", label: "Shop Art", url: "/shop" },
      scrollLabel: "Scroll",
      sectionLabel: "01 — Introduction",
    },
    artworksCarousel: {
      _type: "object",
      eyebrow: "The collection",
      heading: "Welcome to the creative world of HaydenGoSeek.",
    },
    teamSlider: { _type: "object", eyebrow: "The artist" },
    faqSection: { _type: "object", heading: "Frequently asked questions", showSection: true },
    contactSection: {
      _type: "object",
      eyebrow: "Say g'day",
      headingLines: ["Say g'day,", "let's chat"],
      note: "Hayden will get back to you personally, within 24 hours.",
      directEmail: "info@haydengoseek.com",
      studioAddress: "10 Ferry Road, Southport QLD",
    },
  })

  console.log("Seeding siteSettings…")
  await client.createOrReplace({
    _id: "siteSettings-singleton",
    _type: "siteSettings",
    title: "HaydenGoSeek",
    announcementText: "Original artworks, fine art prints & handcrafted framing — Gold Coast, Australia",
    navLinks: [
      { _key: crypto.randomUUID(), label: "Home", href: "/" },
      { _key: crypto.randomUUID(), label: "Shop", href: "/shop" },
      { _key: crypto.randomUUID(), label: "About", href: "/#about" },
      { _key: crypto.randomUUID(), label: "Blog", href: "/blog" },
      { _key: crypto.randomUUID(), label: "FAQs", href: "/#faq" },
      { _key: crypto.randomUUID(), label: "Contact", href: "/#contact" },
    ],
    contactEmail: "info@haydengoseek.com",
    address: "10 Ferry Road, Southport QLD",
    socialLinks: [{ _key: crypto.randomUUID(), platform: "Instagram", url: "https://instagram.com" }],
    footerColumns: [
      {
        _key: crypto.randomUUID(),
        heading: "Shop",
        links: [
          { _key: crypto.randomUUID(), label: "All artworks", href: "/shop" },
          { _key: crypto.randomUUID(), label: "Originals", href: "/shop?type=original" },
          { _key: crypto.randomUUID(), label: "Prints", href: "/shop?type=print" },
        ],
      },
      {
        _key: crypto.randomUUID(),
        heading: "Support",
        links: [
          { _key: crypto.randomUUID(), label: "Contact", href: "/contact" },
          { _key: crypto.randomUUID(), label: "Shipping & returns", href: "/shipping-returns" },
          { _key: crypto.randomUUID(), label: "FAQ", href: "/#faq" },
        ],
      },
      {
        _key: crypto.randomUUID(),
        heading: "About",
        links: [
          { _key: crypto.randomUUID(), label: "About Hayden", href: "/about" },
          { _key: crypto.randomUUID(), label: "Instagram", href: "https://instagram.com" },
        ],
      },
    ],
    newsletterHeading: "Keep in touch",
    newsletterBody: "Sign up to hear about new artworks and limited editions.",
    newsletterPlaceholder: "Enter your email",
    copyrightName: "HaydenGoSeek",
  })

  console.log("Seeding artistBio…")
  await client.createOrReplace({
    _id: "artistBio-singleton",
    _type: "artistBio",
    name: "Hayden Andrews",
    role: "Artist & Musician",
    bio: [block(ARTIST_BIO_PARAGRAPH)],
  })

  console.log(`Seeding ${FAQS.length} faqItem documents…`)
  await Promise.all(
    FAQS.map((faq, i) =>
      client.createOrReplace({
        _id: `faqItem-${i + 1}`,
        _type: "faqItem",
        question: faq.question,
        answer: [block(faq.answer)],
        order: i + 1,
      })
    )
  )

  console.log("Seeding generic pages (about, contact, shipping-returns)…")
  await client.createOrReplace({
    _id: "page-about",
    _type: "page",
    title: "About Hayden",
    slug: { _type: "slug", current: "about" },
    body: [block(ARTIST_BIO_PARAGRAPH)],
  })
  await client.createOrReplace({
    _id: "page-contact",
    _type: "page",
    title: "Contact",
    slug: { _type: "slug", current: "contact" },
    body: [
      block("Say g'day — Hayden will get back to you personally, within 24 hours."),
      block("Use the contact form on the homepage, or reach out directly at info@haydengoseek.com."),
      block("Studio: 10 Ferry Road, Southport QLD"),
    ],
  })
  await client.createOrReplace({
    _id: "page-shipping-returns",
    _type: "page",
    title: "Shipping & Returns",
    slug: { _type: "slug", current: "shipping-returns" },
    body: [
      block(
        "Most print orders are produced within 7–10 business days. Framed orders generally take 2–3 weeks as each frame is custom made by hand."
      ),
      block("We ship throughout Australia and to many countries worldwide. Shipping costs are calculated at checkout."),
      block(
        "Because each print and frame is made to order, change-of-mind returns aren't accepted. However, if your order arrives damaged or there's a manufacturing issue, we'll make it right — contact us within 48 hours with photos of the artwork and packaging."
      ),
    ],
  })

  console.log("Seeding a sample blog post…")
  await client.createOrReplace({
    _id: "blogPost-welcome",
    _type: "blogPost",
    title: "Welcome to the journal",
    slug: { _type: "slug", current: "welcome-to-the-journal" },
    excerpt: "A new home for notes on process, new releases and what's happening in the studio.",
    body: [
      block(
        "This is where I'll be sharing what's happening in the studio — new artworks as they're finished, behind-the-scenes on framing and printing, and the odd note on music too."
      ),
      block("Check back for updates, or follow along on Instagram in the meantime."),
    ],
    author: "Hayden Andrews",
    publishedAt: new Date().toISOString(),
  })

  console.log("Done.")
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})

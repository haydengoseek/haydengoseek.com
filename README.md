# HaydenGoSeek.com rebuild

Rebuild of haydengoseek.com (currently WordPress/WooCommerce) on Next.js +
Tailwind (storefront) / Sanity (editorial content) / Medusa (commerce) /
Stripe (payments). Full plan: see the plan doc from the planning session, or
`README` sections below for what's built and what's left.

## Structure

```
apps/
  storefront/   Next.js 16 (App Router) + Tailwind v4. Also hosts the embedded
                Sanity Studio at /studio (NextStudio).
  backend/      Medusa v2 commerce backend (products, variants, cart,
                checkout, Stripe payment provider).
  studio/       Standalone Sanity Studio (thin config pointing at the schema
                that lives in apps/storefront/sanity/schemaTypes — the
                embedded /studio route is the primary way this gets used).
scripts/
  haydengoseek-import/
    fetch-catalog.mjs   Pulls the full product catalog (attributes, variation
                        combinations, descriptions, images) from the live
                        WooCommerce Store API (public, read-only) into
                        catalog.json. Re-run any time with:
                          node scripts/haydengoseek-import/fetch-catalog.mjs
    catalog.json        Output of the above — already generated, 14 products.
docker-compose.yml       Local Postgres + Redis for the Medusa backend.
```

## Status — what's built vs what's stubbed

**Built and verified locally:**
- All three apps scaffolded and installed (Next.js/Tailwind, Medusa v2,
  Sanity Studio).
- Medusa backend: Stripe payment provider wired in (`medusa-config.ts`),
  conditionally-enabled S3 file storage provider, Australia/AUD region, GST
  tax region, stock location, placeholder shipping option.
- `apps/backend/src/scripts/seed-haydengoseek.ts` — seeds all 14 products
  from `catalog.json` into Medusa with correct Type/Size/Frame options, 17-20
  variants per product, images tagged by which Frame/Type they represent
  (`metadata: { attribute, value }`, used by the storefront to swap the
  product photo when the shopper changes Frame — replicates WooCommerce's
  per-variation image behavior, which Medusa doesn't do natively), and
  inventory (Original variants: managed, qty 1; prints: unmanaged/made-to-
  order). **Ran successfully against a local scratch database — verified
  variant counts, an Original's stock+manage_inventory, and image tagging
  all came out correct.**
- Sanity schema: `homePage`, `artwork` (editorial overlay per Medusa product,
  joined by `medusaHandle`), `faqItem`, `artistBio`, `siteSettings`, `page`.
  Embedded Studio at `/studio` on the storefront.
- `src/lib/sanity.ts` and `src/lib/medusa.ts` in the storefront — typed
  fetchers for the Sanity content above, plus the variant-image-matching and
  sold-out-Original-hiding logic described in the plan.

**Deliberately stubbed — needs real input before this goes further:**
- **Pricing is a placeholder.** The public WooCommerce API only exposes a
  price *range* per product, not the exact price of each Type/Size/Frame
  combination. The seed script currently prices every Original at the
  product's max price and every print at its min price. **Get Hayden's
  WooCommerce → Products → Export CSV** (exact per-variation SKU/price/
  stock) and replace `resolveVariantPrice()` in the seed script with a real
  lookup — everything else (options, images, categories) doesn't need to
  change. All seeded products are left in `draft` status specifically so
  nothing with placeholder pricing can accidentally go live.
- **Shipping rates are a placeholder** ($25 flat) — need Hayden's actual
  domestic/international rates.
- **Image-to-Frame tagging is a filename heuristic** (`leaves-oak.jpg` →
  Frame=Oak) — correct for "Leaves" but verify each product in the admin
  after seeding; not every filename will match cleanly.
- **No real Sanity project yet.** Creating one requires logging into
  sanity.io with an account — that's a step for you/Hayden to do (`npx
  sanity login` from `apps/studio`, or via sanity.io/manage), then set
  `NEXT_PUBLIC_SANITY_PROJECT_ID` in both `apps/storefront/.env` and
  `apps/studio/.env`.
- **No Stripe keys yet** — add test-mode keys from
  `dashboard.stripe.com/test/apikeys` to `apps/backend/.env`
  (`STRIPE_API_KEY`) and `apps/storefront/.env`
  (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`) to test checkout end-to-end.
- **Storefront UI (shop grid, PDP, cart, checkout pages) is not built yet** —
  this session covered foundations (Phase 1) plus the data layer; the actual
  pages are next.
- **Not deployed** — Vercel (storefront) / Railway (backend) / Sanity's
  managed cloud, per the plan.

## Local development

Requires Docker (for Postgres/Redis) and Node ≥20.

```bash
docker compose up -d
npm run install:all   # installs all three apps
npm run dev           # runs storefront (:3000), backend (:9000), studio (:3333) together
```

First-time backend setup (already done once locally as of this session, but
for a fresh clone):

```bash
cd apps/backend
npx medusa db:migrate
npx medusa exec ./src/scripts/seed-haydengoseek.ts
npm run dev   # then create an admin user at the invite URL it prints
```

Ports are intentionally offset from this developer's other local projects to
avoid collisions: Postgres on `5434`, Redis on `6381` (see
`docker-compose.yml` and `apps/backend/.env`).

## Data migration source

`scripts/haydengoseek-import/catalog.json` was pulled live from
haydengoseek.com's public WooCommerce Store API on 2026-09-04 — 14 products,
all variable with Type (Original/Canvas Print/Paper Print) × Size (Original
one-of-one/Small/Large) × Frame (No frame/Oak/White/Black) attributes.
Re-run `fetch-catalog.mjs` if the live site changes before cutover.

# HaydenGoSeek.com rebuild

Rebuild of haydengoseek.com (currently WordPress/WooCommerce) on Next.js +
Tailwind (storefront) / Sanity (editorial content) / Medusa (commerce) /
Stripe (payments).

## ⏸ Paused here — resuming with Hayden's own Railway account

Everything below is built and working **locally**. Deployment is the next
step, paused as of 2026-09-05 so Hayden can set up his own Railway account
(he'll absorb the monthly hosting cost rather than it going on the
developer's account).

**To resume:**
1. Get Hayden's Railway account login/access.
2. The Vercel CLI here is already logged in (as `markperic`) — reuse it, or
   switch if the storefront should deploy under Hayden's own Vercel account
   too (same reasoning as Railway — ask him for that).
3. Railway CLI here is currently logged into the developer's own account
   (`markperic@gmail.com`) from evaluating hosting options — run
   `npx @railway/cli logout` then `npx @railway/cli login` with Hayden's
   account before provisioning anything, so it lands on his billing.
4. See "Deployment — where this was headed" below for the plan that was in
   progress when we paused (backend hosting options were compared; Railway
   Hobby $5/mo was the recommendation, see that section for why and for the
   free/open-source alternatives considered).

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
Artwork-images/          Hayden's real photography, one folder per artwork
                        (resupplied 2026-09-05). Uploaded to Medusa by the
                        seed script — see "Images" below for the naming
                        convention.
docker-compose.yml       Local Postgres + Redis for the Medusa backend.
.bin/stripe               Stripe CLI (gitignored) — for local webhook testing.
```

## Status — what's built vs what's stubbed

**Built and verified locally, end-to-end:**
- All three apps scaffolded, installed, and running together
  (`npm run dev` from the repo root).
- **Storefront pages**: homepage, `/shop` (listing with category filter),
  and `/products/[handle]` (PDP), styled after teklafabrics.com's layout.
  PDP has a scrollable image gallery (thumbnails + prev/next + counter),
  Type/Size pills, Frame colour swatches (with a distinct diagonal-stripe
  "No frame" swatch), live price updates, and a working Add to Cart (creates
  a real Medusa cart, cookie-persisted, header cart count updates live).
- **Payments**: Stripe wired into Medusa (`medusa-config.ts`, provider id
  deliberately `pp_stripe` — do not add an `id` override there, see the
  comment in that file for why it breaks webhook delivery if you do). Full
  flow tested for real against Stripe's test/sandbox API: cart → payment
  session → PaymentIntent → confirm with a test card → order → capture.
  Webhooks tested too, via the Stripe CLI forwarding to
  `/hooks/payment/stripe`.
- **Product images**: all 14 products seeded with Hayden's real photography
  from `Artwork-images/`, uploaded to Medusa's file storage and tagged by
  Frame/Type per his naming convention (see "Images" below). Variant
  selection swaps the shown photo correctly, audited automatically across
  every real Type×Frame combination for all 14 products with zero mismatches.
  The Original is always shown via its own dedicated photo, and the shop
  grid consistently thumbnails every product with that same Original shot.
- Sanity schema: `homePage`, `artwork`, `faqItem`, `artistBio`,
  `siteSettings`, `page`. Embedded Studio at `/studio` on the storefront —
  no real Sanity project linked yet (see stubs below), so the site currently
  renders sensible fallback copy instead of Sanity content.
- Git repo initialized locally with one commit (see git log). Not pushed to
  a remote yet.

**Deliberately stubbed — needs real input before this goes further:**
- **Pricing is a placeholder.** The public WooCommerce API only exposes a
  price *range* per product, not the exact price of each Type/Size/Frame
  combination. The seed script currently prices every Original at the
  product's max price and every print at its min price. **Get Hayden's
  WooCommerce → Products → Export CSV** (exact per-variation SKU/price/
  stock) and replace `resolveVariantPrice()` in the seed script with a real
  lookup — everything else (options, images, categories) doesn't need to
  change. All seeded products are left in `draft` status for this reason —
  they only get flipped to `published` locally, temporarily, for QA
  (`apps/backend/src/scripts/publish-all.ts`).
- **Shipping rates are a placeholder** ($25 flat) — need Hayden's actual
  domestic/international rates.
- **No real Sanity project yet** — creating one needs a sanity.io login
  (`npx sanity login` from `apps/studio`, or via sanity.io/manage), then set
  `NEXT_PUBLIC_SANITY_PROJECT_ID` in both `apps/storefront/.env` and
  `apps/studio/.env`. No editorial content (bio, FAQ, homepage copy) has
  been written into Sanity yet — the site currently falls back to
  reasonable hardcoded copy.
- **Stripe is in test mode** — real (live) keys need to go in before
  actually taking payment from customers.
- **Cart/checkout pages aren't built** — Add to Cart works end-to-end at the
  data layer, but there's no `/cart` or `/checkout` page UI yet to view or
  complete an order from the storefront itself (the Stripe/Medusa flow was
  proven directly against the API, not through a UI).
- **About/Contact pages** are linked in the nav/footer but not built.
- **Not deployed** — see the pause note at the top of this file.

## Images

`Artwork-images/<Folder>/` holds Hayden's photography, one subfolder per
artwork. Naming convention (all case-insensitive, matched by substring so
exact casing/order doesn't matter):

| Filename contains | Means |
|---|---|
| `og` or `original` | The one-of-one Original — unframed. Also reused as the "Canvas Print + No frame" photo (a canvas print in no frame looks identical to the original). |
| `black`/`blk`, `white`/`wht`, or `oak` (no `print`) | Canvas Print in that frame colour. Also reused for "Original" in a real Frame-Original combo if one ever exists. |
| `print` + a frame colour | Paper Print in that frame. |
| `paper-print` (no colour) | Paper Print, unframed. |
| `mockup` / anything else | Lifestyle/room shot — gallery-only, not matched to any variant. |

Three folder names don't match their product handle 1:1 (`Peaking` →
`peeking-through-the-blinds`, `Storm` → `theres-a-storm-brewing`, `Summer` →
`summer-in-the-city`) — mapped explicitly in `seed-haydengoseek.ts`'s
`IMAGE_FOLDER_BY_HANDLE`.

The storefront's matching logic (`getImageForOptions` in
`apps/storefront/src/lib/medusa.ts`) scores each image against the currently
selected Type/Frame rather than requiring an exact match, since not every
combination has its own photo — see the comments there for the exact rules,
including the special case for how "Original" always resolves to its own
photo regardless of its (technically always-set) Frame value.

## Local development

Requires Docker (for Postgres/Redis) and Node ≥20.

```bash
docker compose up -d
npm run install:all   # installs all three apps
npm run dev           # runs storefront (:3000), backend (:9000), studio (:3333) together
```

First-time backend setup (already done locally as of this session, but for a
fresh clone/reset):

```bash
cd apps/backend
npx medusa db:migrate
npx medusa exec ./src/scripts/seed-haydengoseek.ts   # seeds + uploads real images
npx medusa exec ./src/scripts/publish-all.ts         # flips all products to published, for local QA only
npm run dev   # then create an admin user at the invite URL it prints
```

The seed script prints a new publishable API key every time it runs (each
reseed creates a fresh one) — copy it into
`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` in `apps/storefront/.env` and restart
the storefront.

Ports are intentionally offset from this developer's other local projects to
avoid collisions: Postgres on `5434`, Redis on `6381` (see
`docker-compose.yml` and `apps/backend/.env`).

**Local webhook testing**: `./.bin/stripe listen --api-key <STRIPE_API_KEY
from apps/backend/.env> --forward-to localhost:9000/hooks/payment/stripe`,
then copy the `whsec_...` it prints into `STRIPE_WEBHOOK_SECRET`. This
secret is tied to that specific `stripe listen` session — regenerate it the
same way if you restart that process. Stable production webhooks come from
a Dashboard-created endpoint instead, once deployed.

## Deployment — where this was headed

Not deployed yet (paused — see top of file). For when it resumes:

- **Storefront → Vercel.** CLI already authenticated locally.
- **Backend → hosting TBD, but Railway Hobby ($5/mo minimum) was the
  recommendation** — least setup/maintenance for a Postgres+Redis+Node
  stack, one dashboard. Compared against:
  - *Railway Free* — technically free (30-day trial w/ $5 credit, then very
    tight limits: 1 project, 3 services, 0.5GB RAM/service, 0.5GB volume
    storage) — workable but cramped for Postgres+Redis+Medusa together.
  - *Render + Neon + Upstash* — free, but three separate free tiers stitched
    together, and Render's free web service spins down after 15 min idle
    (≈1 min cold start for the first visitor after a lull).
  - *Fly.io* — no real free tier anymore as of 2026, just a 2-hour/7-day
    trial.
  - *Oracle Cloud "Always Free" + Coolify* — genuinely free forever and open
    source (Coolify is self-hosted, Railway-like deploy UI), but you own the
    server: OS updates, SSL, backups, uptime all become your responsibility.
- **Before deploying the backend**: local file storage (what's seeded now)
  won't survive a Railway/Render redeploy — needs real persistent storage
  (a Railway Volume, or S3-compatible storage like Supabase Storage/R2,
  matching the pattern this developer uses on sibling projects) configured
  in `medusa-config.ts`'s conditional S3 file provider before going live,
  or the product photos will vanish on the first redeploy.
- **Sanity** → Sanity's managed cloud (needs a project created — separate
  from Vercel/Railway, doesn't need Hayden's billing info, free tier is
  generous for a site this size).

## Data migration source

`scripts/haydengoseek-import/catalog.json` was pulled live from
haydengoseek.com's public WooCommerce Store API on 2026-09-04 — 14 products,
all variable with Type (Original/Canvas Print/Paper Print) × Size (Original
one-of-one/Small/Large) × Frame (No frame/Oak/White/Black) attributes.
Re-run `fetch-catalog.mjs` if the live site changes before cutover.

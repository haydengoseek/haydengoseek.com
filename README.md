# HaydenGoSeek.com rebuild

Rebuild of haydengoseek.com (currently WordPress/WooCommerce) on Next.js +
Tailwind (storefront) / Sanity (editorial content) / Medusa (commerce) /
Stripe (payments).

## 🚀 Live — both backend and storefront deployed

Both the backend and storefront are now deployed to Hayden's own Railway
and Vercel accounts, as of 2026-09-05:
- **Backend**: `https://backend-production-eae1.up.railway.app` (Railway
  project "haydengoseek" — Postgres, Redis, backend services; volume
  attached for images; migrations run; 14 products seeded).
- **Storefront**: `https://storefront-three-ochre.vercel.app` (Vercel
  project "storefront" under the `haydengoseek` team).

**Still open before this is customer-ready:**
1. ~~Fix placeholder pricing~~ — done 2026-09-05. All 14 products are
   **live and published** with exact per-variation prices, scraped
   directly from the WooCommerce product pages rather than waiting on a
   CSV export. See "Deployment — current status" below for how.
2. **`STRIPE_WEBHOOK_SECRET` isn't set on the backend yet** — creating a
   Stripe webhook endpoint needs to be done manually via the Stripe
   Dashboard (an agent session can't do this — it's treated as a sensitive
   account change). See "Deployment — current status" for the exact URL/
   events to configure.
3. Real (live) Stripe keys, a real Sanity project, and the cart/checkout
   UI are still stubs — see the full list below.

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
- ~~Pricing is a placeholder~~ — **fixed 2026-09-05.** The public
  WooCommerce Store API only exposes a price *range* per product, but each
  classic product page embeds a `data-product_variations` attribute with
  the real per-variation price (WooCommerce's own variation-form data,
  server-rendered, no auth) — `scripts/haydengoseek-import/fetch-variation-prices.mjs`
  scrapes it for all 14 products into `variation-prices.json`, and
  `resolveVariantPrice()` in the seed script looks up the exact price by
  slug + Type/Size/Frame instead of guessing from the range. Production's
  already-seeded prices were fixed in place with
  `apps/backend/src/scripts/update-variant-prices.ts` (rather than
  reseeding, which would've conflicted on the existing products' unique
  handles) and then published with `publish-all.ts` — all 14 are live now.
  Re-run `fetch-variation-prices.mjs` if Hayden changes prices on the old
  WordPress site before it's decommissioned.
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

## Deployment — current status

Both backend and storefront are live, as of 2026-09-05.

- **Backend → Railway.** Project "haydengoseek" on Hayden's account (Hobby
  plan), live at `https://backend-production-eae1.up.railway.app`.
  Services: `Postgres`, `Redis`, `backend` (this app, deployed via
  `railway up` from `apps/backend`). Migrations run, volume attached at
  `/app/static` for durable file storage, 14 products seeded (see
  "Seeding production" below for how, since the seed script needs files
  from outside `apps/backend`). Still open:
  - **`STRIPE_WEBHOOK_SECRET` isn't set yet.** Create a webhook endpoint in
    the Stripe Dashboard pointed at
    `https://backend-production-eae1.up.railway.app/hooks/payment/stripe`
    for these events: `payment_intent.amount_capturable_updated`,
    `.canceled`, `.partially_funded`, `.payment_failed`, `.processing`,
    `.requires_action`, `.succeeded` — then
    `railway variable set STRIPE_WEBHOOK_SECRET=whsec_... --service backend`.
    (Can't be automated from an agent session — Stripe account changes are
    treated as sensitive.)
  - ~~Products seeded but draft~~ — **published 2026-09-05** with exact
    scraped pricing (see the pricing stub entry above for how). All 14 are
    live on `/store/products` and the storefront's `/shop`.
  - ~~Admin dashboard disabled in production~~ — **fixed 2026-09-05**, see
    the gotcha below. Live at
    `https://backend-production-eae1.up.railway.app/app`. An invite was
    sent to `markperic@gmail.com` to set up the first admin login — add
    Hayden's own account from inside the admin (Settings → Users) once
    he's ready, rather than re-inviting via CLI.
  - Real (live) Stripe keys still need to replace the test-mode
    `STRIPE_API_KEY` before actually taking payment — see the stubs list.
- **Storefront → Vercel.** Project "storefront" under the `haydengoseek`
  Vercel team, live at `https://storefront-three-ochre.vercel.app`. Env
  vars set: `NEXT_PUBLIC_MEDUSA_BACKEND_URL` (the Railway URL above),
  `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (from the production seed run —
  regenerate and update here if the production store ever gets reseeded),
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (test mode, same as local),
  `NEXT_PUBLIC_SANITY_DATASET`. `apps/storefront/vercel.json` pins
  `framework: nextjs` — without it Vercel failed to auto-detect Next.js in
  this monorepo subdirectory and looked for a `dist` output folder instead
  of `.next`.
- **Seeding production** — the seed script resolves `catalog.json` and
  `Artwork-images/` relative to its own file location assuming the full
  monorepo checkout (`../../../../` from `apps/backend/src/scripts/`), but
  Railway only deploys `apps/backend` itself, so those paths don't exist in
  the container. Worked around by uploading both directly into the running
  container first: `railway service files upload
  ../../scripts/haydengoseek-import/catalog.json
  /scripts/haydengoseek-import/catalog.json --service backend` and the same
  for `../../Artwork-images` → `/Artwork-images`, then
  `railway ssh --service backend -- npx medusa exec
  ./src/scripts/seed-haydengoseek.ts`. Note **`railway run` won't work for
  this** — it executes locally but injects Railway's internal DB hostname
  (`postgres.railway.internal`), which only resolves from inside Railway's
  network; `railway ssh` (which runs the actual command on the container)
  is required for anything touching the database.
- **Backend hosting comparison** (why Railway Hobby was chosen over the
  alternatives):
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
- **File storage — using a Railway Volume, attached and working.** Local
  file storage doesn't survive a Railway redeploy on its own, since the
  container's disk is ephemeral. `medusa-config.ts` explicitly configures
  `@medusajs/file-local` with `upload_dir`/`backend_url` read from
  `UPLOAD_DIR`/`MEDUSA_BACKEND_URL` (falls back to `./static`/localhost for
  local dev, unchanged) — in production these point at the attached Volume
  (`/app/static`) and the backend's public Railway URL. Product images
  uploaded by the seed script now persist across redeploys. An
  S3-compatible provider (`@medusajs/file-s3`, e.g. Supabase Storage or
  Cloudflare R2) is still wired up as an alternative — set `S3_FILE_URL`
  (and the other `S3_*` vars) to switch to it instead, see `.env.example`.
- **Sanity** → Sanity's managed cloud (needs a project created — separate
  from Vercel/Railway, doesn't need Hayden's billing info, free tier is
  generous for a site this size).
- **Admin dashboard gotcha — fixed 2026-09-05.** `medusa build` compiles
  the admin dashboard's static files into `.medusa/server/public/admin`,
  but `medusa start` run from the project root (what a plain
  `npm run build && npm run start` Railway deploy does) looks for them at
  `<cwd>/public/admin` instead and crash-loops with "Could not find
  index.html in the admin build directory". The docs' suggested fix
  (deploying from inside `.medusa/server`, e.g. `cd .medusa/server && npm
  run start`) didn't work reliably on Railway for reasons that never fully
  resolved — the container couldn't find that directory at the exact
  moment the start command ran despite it genuinely existing on disk
  (confirmed with a diagnostic `ls`), and abandoning that approach in favor
  of `DISABLE_ADMIN=true` was the first fix that shipped. The actual fix
  needs no start-command changes at all: `apps/backend/package.json`'s
  `build` script now copies `.medusa/server/public/admin` to
  `./public/admin` right after `medusa build`, so plain `medusa start` from
  the root finds it where it already expects to look.

## Data migration source

`scripts/haydengoseek-import/catalog.json` was pulled live from
haydengoseek.com's public WooCommerce Store API on 2026-09-04 — 14 products,
all variable with Type (Original/Canvas Print/Paper Print) × Size (Original
one-of-one/Small/Large) × Frame (No frame/Oak/White/Black) attributes.
Re-run `fetch-catalog.mjs` if the live site changes before cutover.

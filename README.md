# HaydenGoSeek.com rebuild

Rebuild of haydengoseek.com (currently WordPress/WooCommerce) on Next.js +
Tailwind (storefront) / Sanity (editorial content) / Medusa (commerce) /
Stripe (payments).

## 🚀 Status: live, taking real orders (as of 2026-09-09)

**If you're returning after a break, start here.** Short version: the
site works end-to-end and real money moves through it now — nothing below
is broken, it's what's still a placeholder or unbuilt. Read the bullets
below for what's live, "Still open" right after for what's next, and
"Picking this up on a different machine" further down before touching
anything if you're not on this exact laptop.

- **Site**: [haydengoseek.com](https://haydengoseek.com) — live since
  2026-09-07 (DNS cut over to Cloudflare → Vercel; see "Custom domain & DNS"
  below). Also reachable at
  `https://storefront-three-ochre.vercel.app` (Vercel project "storefront"
  under the `haydengoseek` team).
- **Backend**: `https://backend-production-eae1.up.railway.app` (Railway
  project "haydengoseek" — Postgres, Redis, backend services; volume
  attached for images; migrations run; 14 products seeded). Admin dashboard
  at `/app` — see "Medusa admin access" below.
- **Sanity CMS**: real project (`vy869vh5`, "HaydenGoSeek") created
  2026-09-07 — header, footer, hero, FAQ, contact, and a new blog are all
  editable from Studio (`/studio` on the storefront), pre-seeded with the
  site's real copy. See "Sanity CMS" below.
- **Order emails**: customer confirmation + admin new-order alert, both
  sending correctly via Resend as of 2026-09-08. See "Order emails" below.
- **Payments are live**: Stripe switched from test to live mode
  2026-09-09 — real cards are now actually charged (automatic capture) on
  checkout. See "Stripe" below for the full cutover checklist.

**Still open before this is fully customer-ready:**
1. Shipping rates are still the $25 flat AU placeholder on every product
   (now individually editable per artwork — see "Shipping: Local Pickup +
   per-product pricing" — but nobody's gone through and set real ones yet),
   and only Australia is a configured region/shipping zone — see "Cart &
   checkout" for the international-shipping gap this surfaced.
2. Custom email for the domain — deliberately left on Hostinger for now
   (Hayden's decision, 2026-09-07); MX/SPF/DKIM/DMARC all preserved
   untouched through the DNS cutover. Zoho Mail's free tier was the
   recommended path if this ever needs to move off Hostinger.
3. **Composite shipping pricing** (discussed 2026-09-09, not yet built):
   right now shipping is always a straight sum of each cart item's own
   per-product rate. Mark wants rules like "2+ canvas framed prints ships
   for less than A+B" and "extra paper prints ship free." The mechanism
   exists natively — a `ShippingOption` with `price_type: "calculated"`
   delegates to a custom Fulfillment Provider's `calculatePrice()`, which
   receives every line item in the whole cart (not scoped to one shipping
   profile) — same extension pattern as the existing Resend notification
   provider (`apps/backend/src/modules/resend/`). Needs: a shipping-class
   classification per product (canvas-framed / paper-unframed / original —
   probably reusing the existing Frame/Type variant options), the new
   provider itself, and Mark to pin down the exact rule wording (combined
   vs. per-extra-item discount math) before coding.
4. **The homepage "Say g'day" contact form has no submit handler** —
   presentational only (`ContactSection.tsx`), by design until this was
   built (see its own comment: "the host page owns action/method/onSubmit
   once that's built"). A visitor filling it in today gets no error, but
   nothing happens and nobody hears about it. Order emails already proved
   the Resend plumbing works (see "Order emails") — wiring this up would
   reuse the same provider, just a new subscriber/action instead of
   `order.placed`.

## Picking this up on a different machine

Everything that matters is already durable — committed to git, or living in
Railway/Vercel/Sanity's own cloud (not this machine). Two things are
genuinely per-machine and need redoing on a new one:

1. **CLI logins.** `railway`, `vercel`, and `sanity` CLIs are all
   authenticated locally (`~/.railway`, `~/Library/Application
   Support/com.vercel.cli`, Sanity's own global config) — none of that
   transfers. Re-authenticate with `npx @railway/cli login`, `npx vercel
   login`, `npx sanity login` (all browser-based device-flow; driving them
   through an already-logged-in Chrome session works fine, see
   `feedback_chrome_cli_oauth` if using Claude Code). Railway/Vercel logins
   are Hayden's own accounts (`haydengoseek@gmail.com`); Sanity is Mark's.
2. **`.env` files** (gitignored, per app). Copy `apps/storefront/.env.example`
   → `.env` — it already has the real Sanity project ID filled in. Backend
   needs `apps/backend/.env` set up per its own `.env.example` (Stripe test
   key, DB/Redis connection for local Docker).

Everything else — schema, seeded Sanity content, deployed code, DNS,
Medusa admin login — is already live and doesn't depend on this machine.
One deploy gotcha worth knowing before pushing more changes: **this Vercel
project has no GitHub auto-deploy connected**, so `git push` alone does not
deploy — run `vercel --prod` from `apps/storefront` explicitly after
pushing (see "Deployment — current status").

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
  The homepage (2026-09-05 redesign, iterated since) is composed from
  modules ported from the `Claude-Agency-Website-Build` project's numbered
  module catalog — see
  `https://showcase.capote.design/examples/estate-agency` for the specific
  reference page several sections were adapted from — restyled to this
  site's own warm-neutral palette, with Motion + Lenis smooth-scroll scoped
  to a `(marketing)` route group (`apps/storefront/src/app/(site)/(marketing)/`)
  so `/shop` and `/products/[handle]` stay on plain native scroll,
  unanimated, as before. Current section order:
  1. **Hero** (`components/landing/HeroCinematic.tsx`, module 87) — a
     six-beat scroll-scrubbed curtain reveal: real logo
     (`public/logo-white.svg`), Hayden's real artwork photography as the
     backdrop and reveal image (`public/hero/my-friends.jpg`,
     `public/hero/weavings.jpg` — rotated 90° to landscape), a closing
     frame over `public/hero/haydo-home.jpg` with a dark scrim + text
     drop-shadow for legibility, then a light reveal panel with the real
     WordPress "About" intro paragraph and a Shop Art CTA.
  2. **The Collection** (`components/landing/ArtworksCarousel.tsx`, module
     88 simplified) — a paginated carousel of square product thumbnails,
     four per page, plus a row of real stat "honors" (songs written, years
     framing, etc.).
  3. ~~Stats column scroller~~ — removed from the page for now but kept on
     file at `components/landing/StatsScroller.tsx` (module 89) for later;
     not wired into `page.tsx`.
  4. **The Artist** (`components/landing/TeamSlider.tsx`, module 94) —
     Hayden's real bio and portrait (`public/team/hayden.jpg`), built to
     support more people later via its `members` array, but just him for
     now.
  5. **FAQ** (`components/landing/Faq.tsx`, module 10) — all 17 real Q&As
     from the WordPress site, with answers (the original homepage fetched
     `faqItem` but never rendered the answer field — fixed as part of this
     redesign).
  6. **Contact** (`components/landing/ContactSection.tsx`, module 95) — a
     presentational "Say g'day" statement form, no submit handler wired
     yet.

  Every text field pulls from Sanity (`homePage`, `artistBio`, `faqItem`,
  `siteSettings`) with the exact real current copy as the fallback (see
  "Sanity CMS" below), so nothing regresses if a field is ever left blank.
  Header/footer nav, announcement bar, and footer columns are now Sanity-
  driven too. `/blog` and `/blog/[slug]` (new, 2026-09-07) and the generic
  `/about`, `/contact`, `/shipping-returns` pages all live in the same
  `(marketing)` group to inherit the Motion/Lenis treatment.
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
- **Sanity CMS — real project, fully wired, 2026-09-07.** Schema:
  `homePage` (hero/carousel/team/faq/contact, reworked to match the actual
  live components), `siteSettings` (nav, announcement bar, footer columns,
  newsletter, social), `artistBio` (+ `role` field), `faqItem` (17 real
  Q&As), `page` (generic — powers `/about`, `/contact`,
  `/shipping-returns`), `blogPost` (new), `artwork` (per-product editorial
  overlay — schema exists, not yet wired into the PDP). Embedded Studio at
  `/studio`. Seeded with the site's real current copy via
  `apps/storefront/scripts/seed-sanity-content.ts` (`npx sanity exec
  scripts/seed-sanity-content.ts --with-user-token`, idempotent — safe to
  re-run). See "Sanity CMS" under Deployment for project details, CORS,
  and env vars.
- **Product display order** — Medusa's core Product model has no built-in
  manual-sort field, so `apps/storefront/src/lib/medusa.ts`'s
  `listProducts()` sorts by an optional `display_order` number set per
  product in the admin's Metadata editor instead (lower first; products
  without one keep their existing order, after any that have it set).
- Git repo pushed to `https://github.com/haydengoseek/haydengoseek.com`
  (main branch). **Note: this Vercel project has no GitHub auto-deploy
  connected** (`vercel git connect` was never run) — pushing to GitHub does
  *not* trigger a production deploy on its own. Deploy explicitly with
  `vercel --prod` from `apps/storefront` after pushing.

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
- **Shipping rates are a placeholder** ($25 flat on every product) — need
  Hayden's actual domestic/international rates, now settable per artwork
  (see "Shipping: Local Pickup + per-product pricing").
- ~~Stripe is in test mode~~ — **live since 2026-09-09**, real cards charge
  for real now. See "Stripe" below for the full cutover.
- ~~Cart/checkout pages aren't built~~ — **built and verified 2026-09-08**,
  full click-through `/cart` → `/checkout` → order confirmation, real
  Stripe Payment Element, real Medusa order created. See "Cart & checkout"
  below.
- **`/about`, `/contact`, `/shipping-returns`** are real, live, Sanity-backed
  pages now (2026-09-07) but seeded with brief starter copy — worth having
  Hayden expand them in Studio.
- **`artwork` Sanity document type** (per-product editorial story/gallery)
  exists in the schema but isn't wired into the PDP (`/products/[handle]`)
  yet — product pages are still 100% Medusa-driven, per Mark's call to keep
  shop content on Medusa rather than split it across two systems.

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

## Favicon

`apps/storefront/src/app/icon.svg` — Next's App Router auto-detects this
filename, no manifest/metadata wiring needed. Content is the "HS" monogram
from `svg/favicon-white.svg` (source file supplied by Mark, kept as-is,
uncropped — an earlier attempt that cropped tightly to just the H was
rejected in favour of using the supplied mark whole) with a dark square
background (`#17140f`) added so it reads on both light and dark browser
tabs. The stock Next.js `favicon.ico` was deleted so it doesn't take
precedence over `icon.svg` in browsers that prefer `.ico`.

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

**Sanity, on a fresh checkout/machine**: `apps/storefront/.env` is
gitignored, so copy `.env.example` → `.env` and it'll already have the real
`NEXT_PUBLIC_SANITY_PROJECT_ID` (`vy869vh5`) filled in — `sanity.cli.ts` (committed)
has the same ID hardcoded for CLI use. The Sanity CLI itself
(`npx sanity ...` from `apps/storefront`) needs its own login on a new
machine — `npx sanity login`, browser-based — before commands like `sanity
exec`, `sanity cors`, or re-running the seed script will work there.

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
  - ~~Products seeded but draft~~ — **published 2026-09-05** with exact
    scraped pricing (see the pricing stub entry above for how). All 14 are
    live on `/store/products` and the storefront's `/shop`.
  - ~~Admin dashboard disabled in production~~ — **fixed 2026-09-05**, see
    the gotcha below. Live at
    `https://backend-production-eae1.up.railway.app/app`. Admin login was
    fixed 2026-09-07 (see "Medusa admin access" below) — the original
    invite approach never worked out.
  - ~~Real (live) Stripe keys still need to replace the test-mode
    `STRIPE_API_KEY`~~ — **done 2026-09-09**, see "Stripe" below.
- **Storefront → Vercel.** Project "storefront" under the `haydengoseek`
  Vercel team, live at `https://storefront-three-ochre.vercel.app`. Env
  vars set: `NEXT_PUBLIC_MEDUSA_BACKEND_URL` (the Railway URL above),
  `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (from the production seed run —
  regenerate and update here if the production store ever gets reseeded),
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (live since 2026-09-09 — local dev
  still uses a test-mode key in `apps/backend/.env`/`apps/storefront/.env`,
  only production is live), `NEXT_PUBLIC_SANITY_DATASET`.
  `apps/storefront/vercel.json` pins
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
- **Medusa admin access — fixed 2026-09-07.** The original 2026-09-05
  invite link expired unused, and Medusa v2 has no way to self-register the
  *first* admin user via the API once one doesn't exist — invites require an
  already-authenticated admin to send them. Fixed by creating the user
  directly on the container instead of via the invite flow:
  ```bash
  npx @railway/cli ssh --project 0468e228-77ff-42bf-b57b-82bba4692cac \
    --service 996b307e-8195-427a-a698-6837e3a81f8c \
    --environment c5c10a90-a2a2-4656-8860-a1c899980753 \
    -- npx medusa user -e <email> -p '<password>'
  ```
  (`railway ssh` needs an interactive permission approval in Claude Code's
  auto mode — a chat "yes" isn't enough, the user has to run it themselves
  or loosen the Bash permission first.) Passing all three IDs explicitly
  means it works from any directory, on any machine — no `railway link`
  needed first. Mark's own admin login exists this way now; add Hayden's
  from inside the admin (Settings → Users) once he's ready, rather than
  re-running this for him.

## Custom domain & DNS

`haydengoseek.com` went live on Vercel 2026-09-07, cut over from the
original WordPress/Hostinger hosting. Domain is registered at VentraIP;
DNS was migrated from Hostinger's zone to **Cloudflare** (nameservers
`algin.ns.cloudflare.com` / `raegan.ns.cloudflare.com`) so Mark has a
proper DNS management UI going forward, rather than editing records
directly in Hostinger's zone editor.

- **Records**: `@` and `www` are `A` records to Vercel's `76.76.21.21`,
  both set **DNS only** (grey cloud, not proxied) — Vercel needs to see
  direct traffic to issue its own SSL cert; proxying through Cloudflare
  adds a second TLS hop and can break cert issuance/routing. `www` also has
  a Vercel-side redirect to the apex (set via the Vercel API — no CLI flag
  for domain redirects — `PATCH /v9/projects/{id}/domains/www.haydengoseek.com`
  with `{"redirect": "haydengoseek.com", "redirectStatusCode": 308}`).
- **Email (MX/SPF/DKIM/DMARC/autodiscover/autoconfig) deliberately left on
  Hostinger, untouched** — Hayden's decision, 2026-09-07, revisit later if
  he wants to move off Hostinger mail (Zoho Mail's free tier was the
  recommended path; self-hosting was ruled out due to IP/deliverability
  risk for a small business). **Important**: the DKIM CNAMEs
  (`hostingermail-a/b/c._domainkey`) and `autodiscover`/`autoconfig` CNAMEs
  must stay **DNS only** in Cloudflare too — Cloudflare's proxy only
  handles HTTP(S) traffic, and proxying these breaks DKIM signing/mail
  client autoconfiguration since they're resolved directly by mail
  software, not browsers.
- Vercel domain config: both `haydengoseek.com` and `www.haydengoseek.com`
  added to the `storefront` project (`vercel domains add`).

## Sanity CMS

Real project created 2026-09-07: **`vy869vh5`** ("HaydenGoSeek"), under
Mark's own Sanity account/organization (same as Geotools/Cowelle — consistent
with this developer's other client projects), dataset `production`.

- **CORS origins** (`npx sanity cors add <origin> --credentials`, needed for
  the embedded Studio's auth to work): `https://haydengoseek.com`,
  `https://www.haydengoseek.com`, `https://storefront-three-ochre.vercel.app`,
  `http://localhost:3000`.
- **Env vars**: `NEXT_PUBLIC_SANITY_PROJECT_ID=vy869vh5`,
  `NEXT_PUBLIC_SANITY_DATASET=production` — set in
  `apps/storefront/.env` (local) and as Vercel Production env vars
  (`vercel env add`). `sanity.cli.ts` (committed, new) hardcodes the same
  project ID for CLI commands (`sanity cors`, `sanity exec`, etc.) run
  from `apps/storefront`.
- **Access**: only Mark is currently a project member (Administrator role).
  Hayden has no Sanity login yet — invite `haydengoseek@gmail.com` as an
  Editor from [sanity.io/manage](https://sanity.io/manage) (project
  `vy869vh5` → Members) when he's ready to edit content himself. Sanity
  auth is per-person (Google/GitHub/email login), not a shared password.
- **Content**: seeded via `apps/storefront/scripts/seed-sanity-content.ts`
  (run with `npx sanity exec scripts/seed-sanity-content.ts
  --with-user-token` from `apps/storefront`) — populates `homePage`,
  `siteSettings`, `artistBio`, all 17 `faqItem`s, the three `page` docs
  (about/contact/shipping-returns), and one sample `blogPost`, all with the
  site's real current copy. `createOrReplace` with fixed `_id`s, so it's
  safe to re-run (won't duplicate).
- **`homePage` Studio title fixed 2026-09-08** — it has no top-level
  string field (just nested section objects), so Studio's default preview
  fell back to dumping raw field data as the document title. Fixed with
  an explicit `preview.prepare()` returning a static "Home Page".
- **Generic pages** (`page` schema — about/contact/shipping-returns) got
  an optional `heroImage` field 2026-09-08, rendered above the title when
  set.
- **`artwork` document type is still unused clutter in Studio's nav** —
  scaffolded for future per-product editorial content (story + gallery on
  top of Medusa's product data) but never wired to anything; shows "No
  documents of this type" since none have ever been created. Flagged to
  Mark as a candidate for removal since shop content is meant to stay
  Medusa-only — not yet removed, pending his call.

## Stripe

**Live since 2026-09-09.** Account: `acct_1Su5WrBbNd3JJ1Ni`, AU, AUD,
charges/payouts both enabled, dashboard display name "Real Choice Framing"
(Hayden's framing business — separate from the "HaydenGoSeek" art-selling
brand, but the same Stripe account handles both — confirmed via `GET
/v1/account` before touching anything, since account names can be
confusing across a rebrand).

**Going-live checklist actually done:**
- Hayden rotated the live secret key in Stripe Dashboard (Developers → API
  keys → Rotate key) rather than reusing whatever existed before — clean
  key, never previously exposed anywhere.
- `STRIPE_API_KEY` (Railway) and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  (Vercel) both updated to the live pair, verified via `GET /v1/account`
  against the new secret key before wiring it in.
- **Switched to automatic capture** (`capture: true` added to the Stripe
  provider's options in `medusa-config.ts`) — previously defaulted to
  manual capture (`requires_capture`, needing someone to manually capture
  every payment in Stripe/Medusa admin), which made sense for test-mode
  development but not for a live store taking real orders.
- New live-mode webhook created via Stripe's API pointed at
  `/hooks/payment/stripe`, subscribed to the exact event list
  `@medusajs/payment-stripe` handles (`payment_intent.created`,
  `.processing`, `.canceled`, `.payment_failed`, `.requires_action`,
  `.amount_capturable_updated`, `.partially_funded`, `.succeeded`) — its
  secret went into Railway's `STRIPE_WEBHOOK_SECRET`.
  - **Found and removed a duplicate**: an unlabeled live webhook already
    existed pointed at the same URL (created earlier, before this cutover
    — not, as first suspected, a leftover from the old WooCommerce Stripe
    plugin) with nearly the same event list. Left running alongside the
    new one, every payment event would have double-fired at the backend.
    Deleted it (via the dashboard — deleting live Stripe resources isn't
    something to do unattended through the API) and kept the one whose
    secret was actually captured and wired in.
- **Verified end-to-end without spending real money**: loaded
  `/checkout` live, confirmed via Stripe's API that the resulting
  PaymentIntent had `livemode: true`, the correct cart total, and
  `capture_method: automatic`; confirmed the webhook delivered cleanly
  (`pending_webhooks: 0` on the resulting Stripe event, `200` in Railway's
  logs) — then cancelled that PaymentIntent since it was never paid, to
  keep it out of Hayden's dashboard.
- Test mode is still fully available by switching to a Stripe Sandbox
  (`dashboard.stripe.com` → business name top-left → "Switch to sandbox")
  if development on this project resumes later — it uses entirely separate
  keys/webhooks from live mode, so nothing here needs to change for that.

## Cart & checkout

Built and verified 2026-09-08, streamlined further the same day — full
guest checkout (no accounts/login; none existed before, out of scope).
Key files: `apps/storefront/src/app/(site)/checkout/{page,confirmed/page}.tsx`
(`(site)/cart/page.tsx` is now just `redirect("/checkout")` — see below),
`components/cart/{CartLineItem,CartButton,CartDrawer,CartDrawerContext}.tsx`,
`components/checkout/{CheckoutForm,CheckoutFields,OrderCompleter}.tsx`.
`lib/cart-actions.ts` grew from just `addToCart`/`getCartItemCount` to the
full set (`getCart`, line-item update/remove, shipping options, checkout
details, Stripe payment session, order completion).

**Streamlined same day, per Mark's request to cut clicks:**
- **Floating cart drawer** replaces the old plain "Cart (N)" header text —
  a slide-out panel (client-side, no page load) showing live, editable
  line items. Opens automatically on a successful add-to-cart, or via the
  header's cart icon (`CartButton.tsx`) any time. State lives in
  `CartDrawerContext.tsx`, mounted once in `(site)/layout.tsx`.
- **`/cart` merged into `/checkout`** — one URL, one page: editable line
  items alongside the address + payment form. The old separate `/cart`
  page is now just a redirect.
- **Checkout collapsed from two steps to one.** It used to be: submit
  address → Payment Element reveals → submit again. Now the `/checkout`
  page itself creates the Stripe payment session server-side as soon as
  it loads (auto-attaching Standard Shipping by default — see "Shipping:
  Local Pickup + per-product pricing" below — so the real total is already
  known) and shows the address fields and Payment
  Element together from the start — one "Place order" submit does both
  `setCheckoutDetails` and `stripe.confirmPayment`. Tradeoff worth
  knowing: this creates a Stripe PaymentIntent on every `/checkout` page
  load/refresh, even before the customer commits — harmless (Stripe
  doesn't charge for unconfirmed intents, standard practice) but would
  need revisiting if address-dependent tax/shipping is ever added, since
  the amount is currently computed before the address is known.
- **Payment moved to its own centre column.** The address form and the
  Payment Element used to stack in one left-hand column with the order
  summary off to the side, leaving a large empty gap on wide screens.
  `checkout/page.tsx`'s grid is now `lg:grid-cols-3` (address / payment /
  summary), and `CheckoutFields.tsx`'s `<form>` renders as `display:contents`
  so its two sections (address fields, payment + submit) land directly as
  the first two grid items instead of being wrapped together in one box.
  Collapses to a single stacked column below `lg`.

**Original scope decisions (still true):**
- **Australia only.** Only one region/shipping zone exists (see the seed
  script); country is fixed to `au` rather than a form field. The site's
  own FAQ claims international shipping — that's not actually backed by
  the commerce config yet, worth flagging to Hayden separately since real
  international rates would be needed first.
- No separate billing address (reused from shipping) — reasonable for a
  small solo-artist store, not attempted here.
- ~~No order confirmation emails~~ — **built 2026-09-08**, see "Order
  emails" below.

**Six real bugs found and fixed across both sessions** (none caught by
type-checking or reading the code):
1. Increasing a cart line item's quantity past a one-of-one Original's
   real stock crashed the whole page — Medusa correctly rejects it
   server-side, but the server action let the error bubble up uncaught.
   Fixed by having `updateLineItemQuantity` return `{success, error}`
   instead of throwing, shown inline per line item.
2. `/checkout/confirmed` crashed outright: Next.js only allows
   `cookies().delete()` inside a genuine client-invoked Server Action, not
   during a Server Component's render — and the page was directly
   `await`-ing `completeOrder()` (which clears the cart cookie) during
   render. Fixed by moving that call into a client component
   (`OrderCompleter.tsx`) that triggers it from `useEffect` instead.
3. After fixing #2, the confirmation page still hung on "Finalising your
   order…" forever even though the order was created correctly server-side
   every time (confirmed via the Store API directly). Cause: React Strict
   Mode's dev-only synchronous mount → cleanup → remount cycle was setting
   a `cancelled` flag (meant to guard against setState-after-unmount) to
   `true` before the one real `completeOrder()` call's promise resolved,
   silently discarding its result. A `useRef` guard already made the call
   fire exactly once — the additional `cancelled` check was actively
   harmful once that was in place, so it was removed rather than patched
   further.
4. **Found in real production use, 2026-09-08** (not caught during the
   original verification pass): adding "Aztec Jewellery" to the cart
   crashed the page outright. Root cause: `stockedQuantity()` (in
   `lib/medusa.ts`) only ever summed `stocked_quantity`, never
   `reserved_quantity` — so a one-of-one Original sitting fully reserved
   in someone's abandoned cart (`stocked: 1, reserved: 1`, so genuinely 0
   available) still displayed as a selectable Type option, and only
   Medusa's own backend check rejected the add, uncaught. Fixed at the
   root (available = stocked − reserved, so it now correctly disappears
   from the selector like an already-sold Original does) plus a backstop:
   `addToCart` now returns `{success, error}` instead of throwing, for the
   legitimate race where two people try to buy the last unit at once.
5. **Caught while streamlining checkout, same day**: after attaching the
   shipping method server-side, re-fetching the cart to get real totals
   returned the *pre-shipping* snapshot (shipping showed $0). Cause:
   Next's per-request fetch memoization deduped the second identical
   `getCart()` call within the same render — same URL, same options, so
   React treated it as the same request and returned the cached result
   instead of hitting the network again. Fixed by giving `getCart()`'s
   underlying request a unique header on every call, so cart reads never
   get silently deduped against each other.
6. **Same session**: Medusa's own cart `subtotal` field is actually
   items + shipping combined (per its own doc comment), not items-only —
   directly above a separate "Shipping" row this looked like shipping was
   being charged twice. Fixed by fetching `item_subtotal` instead and
   using that as the displayed "Subtotal".

**How it was actually verified**: the Browser tool's remote pane couldn't
get real keystrokes into Stripe's cross-origin Payment Element iframe (a
known friction point automating third-party payment iframes) — clicks
landed inside the right iframe (confirmed via `getBoundingClientRect()`)
but never visibly expanded card fields. Worked around it by letting the
real UI create the actual Stripe PaymentIntent (proving `createPaymentSession`
end-to-end with the correct order amount), then confirming that PaymentIntent
directly via Stripe's API with a test payment method (`pm_card_visa`) and
loading `/checkout/confirmed` with the resulting query params — exercising
the exact same code path a real redirect-back would. This is how bugs #2
and #3 above were actually caught.

## Shipping: Local Pickup + per-product pricing

Built 2026-09-09, per Mark's request. Two changes:

1. **"Local Pickup" option** — customers can tick a box at checkout to
   collect from the Gold Coast studio instead of paying for shipping.
2. **Per-product shipping prices** — previously all 14 products shared one
   `ShippingProfile` ("Framed Artwork"), so every product was stuck on the
   same flat $25 rate. Each product now has its own dedicated shipping
   profile, so Hayden can set a custom shipping price on any individual
   artwork from the admin (Settings → Locations → Shipping → find that
   product's profile → edit its "Standard Shipping" option's price) without
   touching code.

**How it works**: every product's shipping profile carries the same two
named shipping options on the shared "Australia" service zone — "Standard
Shipping" (currently $25, editable per product) and "Local Pickup" (always
$0). `apps/backend/src/scripts/migrate-per-product-shipping.ts` is the
one-off migration that split the original shared profile into 14
individual ones (idempotent — safe to re-run, skips already-migrated
products); `seed-haydengoseek.ts` was also updated to create per-product
profiles from scratch for any future fresh seed.

**Why this needed more than a checkbox**: Medusa requires a cart to have a
shipping method for *every distinct shipping profile* represented among its
line items before it'll let you complete an order (`validateShippingStep`).
Once shipping profiles are per-product, a cart with two different artworks
in it spans two profiles — so the storefront can't just track one "shipping
option id", it has to track a method per profile. `cart-actions.ts`'s
`getShippingChoice`/`setShippingChoice`/`initShippingIfNeeded` handle this:
the checkout page still shows a single Standard/Pickup toggle (not one
picker per profile — overkill for a niche art store), but flipping it calls
`addShippingMethod` once for every distinct profile currently in the cart,
so multi-item carts are billed (or comped) correctly across all of them.
Verified locally with both a single-product cart ($25 → free on toggle) and
a two-different-products cart ($50 → free on toggle, i.e. both profiles'
options swapped together).

**Scope decision**: the checkout address form stays visible either way
(Mark's call) rather than hiding it for pickup orders — one less
conditional-UI path, and Hayden still gets the customer's name/contact
details for arranging pickup.

## Order emails

Built 2026-09-08 — customer order confirmation + admin new-order alert,
via a custom Resend notification provider (nothing like this existed
before: no notification module configured, `src/subscribers/` was just
the stock README, and the `resend` npm package was installed on the
storefront but never actually used anywhere).

- **Provider**: `apps/backend/src/modules/resend/` — `service.ts`
  (`ResendNotificationService extends AbstractNotificationProviderService`,
  same base class and shape as the stock `@medusajs/notification-sendgrid`
  provider, just using Resend's SDK and plain inline-HTML `content`
  instead of a third-party template ID), `index.ts` (`ModuleProvider(Modules.NOTIFICATION, ...)`,
  same export pattern as that same stock provider), `templates.ts` (two
  small plain-HTML-string builders — no React Email or external template
  system, matching how simple the rest of this codebase's presentation
  layer is). Registered in `medusa-config.ts` alongside the existing
  `payment`/`file` module blocks.
- **Subscriber**: `apps/backend/src/subscribers/order-placed.ts`, on
  `order.placed` — sends one customer confirmation (to the order's email)
  and one admin alert each to `info@haydengoseek.com` and
  `markperic@gmail.com` (comma-separated in `ADMIN_NOTIFICATION_EMAILS`).
- **Sending domain**: `orders@haydengoseek.com`, verified in Resend
  (2 domain entries briefly existed — one from the dashboard's
  auto-Cloudflare-DNS integration, one created redundantly via the API in
  parallel; the API-created duplicate was deleted, the dashboard one kept
  and verified) via 3 DNS records on the `send.haydengoseek.com`
  subdomain (SPF TXT + MX, DKIM TXT) — scoped to that subdomain, so no
  conflict with Hostinger's existing root-domain mail records.
- **Env vars** (`apps/backend/.env`, `.env.example`, and Railway
  production): `RESEND_API_KEY`, `RESEND_FROM_EMAIL=orders@haydengoseek.com`,
  `ADMIN_NOTIFICATION_EMAILS=info@haydengoseek.com,markperic@gmail.com`.
- **Deploying backend code changes**: worth remembering — like the
  storefront/Vercel, this Railway service has no GitHub auto-deploy
  connected (`source: {repo: null}`), so `git push` alone does not deploy
  new backend code. Setting a Railway variable *does* auto-trigger a
  redeploy, but only rebuilds whatever was last uploaded — to actually
  ship code changes, run `railway up --service <id> --environment <id>`
  from `apps/backend` explicitly (confirmed by testing: the env-var-triggered
  redeploy alone would have shipped the new env vars against stale code
  with no notification module).
- **Verified working end-to-end, both locally and in production** —
  placed a real test order against each, confirmed via Resend's own
  `/emails` log that all three notifications (customer + 2 admin) were
  sent and marked `delivered` each time.
- Out of scope, not attempted: wiring the same Resend setup into
  `ContactSection.tsx`'s still-unbuilt contact form (separate, unrelated
  piece of work).

## Data migration source

`scripts/haydengoseek-import/catalog.json` was pulled live from
haydengoseek.com's public WooCommerce Store API on 2026-09-04 — 14 products,
all variable with Type (Original/Canvas Print/Paper Print) × Size (Original
one-of-one/Small/Large) × Frame (No frame/Oak/White/Black) attributes.
Re-run `fetch-catalog.mjs` if the live site changes before cutover.

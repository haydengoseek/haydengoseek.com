import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  // Disabled in production via DISABLE_ADMIN: `medusa start` from the
  // project root only finds the admin build's index.html when run from
  // .medusa/server (the actual medusa build output dir), which broke the
  // Railway deploy. Manage the store via `npm run dev`'s admin locally for
  // now instead of fighting that path — revisit hosting admin properly later.
  admin: {
    disable: process.env.DISABLE_ADMIN === "true",
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/payment-stripe",
            // No `id` here deliberately: the container registers this provider
            // as `pp_${identifier}${id ? "_"+id : ""}` (see
            // @medusajs/payment/dist/loaders/providers.js), and the identifier
            // for @medusajs/payment-stripe is already "stripe" — adding a
            // redundant id: "stripe" here registers it as pp_stripe_stripe
            // instead of pp_stripe. The webhook route (/hooks/payment/[provider])
            // derives providerId as `pp_${provider}` straight from the URL
            // segment, with no way to add a suffix — so it can only ever look up
            // pp_stripe, and a mismatched id here breaks every incoming webhook
            // with a silent AwilixResolutionError (confirmed by testing).
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
            },
          },
        ],
      },
    },
    // Uses S3 once its env vars are set. Otherwise falls back to Medusa's
    // local filesystem provider, pointed at UPLOAD_DIR — in production this
    // must be a mounted Railway Volume path (not the container's ephemeral
    // disk), or every uploaded file is lost on the next redeploy. MEDUSA_BACKEND_URL
    // must be the backend's real public URL in production too, since the
    // local provider bakes it into every file's returned URL.
    process.env.S3_FILE_URL
      ? {
          resolve: "@medusajs/medusa/file",
          options: {
            providers: [
              {
                resolve: "@medusajs/file-s3",
                id: "s3",
                options: {
                  fileUrl: process.env.S3_FILE_URL,
                  accessKeyId: process.env.S3_ACCESS_KEY_ID,
                  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
                  region: process.env.S3_REGION,
                  bucket: process.env.S3_BUCKET,
                  endpoint: process.env.S3_ENDPOINT,
                },
              },
            ],
          },
        }
      : {
          resolve: "@medusajs/medusa/file",
          options: {
            providers: [
              {
                resolve: "@medusajs/file-local",
                id: "local",
                options: {
                  upload_dir: process.env.UPLOAD_DIR,
                  backend_url: `${process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/static`,
                },
              },
            ],
          },
        },
  ],
})

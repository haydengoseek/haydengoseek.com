import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
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
    // Only registered once S3 env vars are set — falls back to Medusa's local
    // filesystem file provider otherwise (fine for local dev, not for
    // production/multi-instance deploys).
    ...(process.env.S3_FILE_URL
      ? [
          {
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
          },
        ]
      : []),
  ],
})

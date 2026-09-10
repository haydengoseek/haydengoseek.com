import Medusa from "@medusajs/js-sdk"

// Admin extensions are always served from the same origin as the backend
// (see medusa-config.ts's `admin.backendUrl` comment), so a relative
// baseUrl plus the same session-cookie auth the dashboard itself uses is
// all that's needed here.
export const sdk = new Medusa({
  baseUrl: "/",
  auth: { type: "session" },
})

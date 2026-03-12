import { httpRouter } from 'convex/server'

import { authComponent, createAuth } from './auth'

const appUrl = process.env.APP_URL || 'http://localhost:3050'
const siteUrl = process.env.CONVEX_SITE_URL!

const http = httpRouter()

authComponent.registerRoutes(http, createAuth, {
  cors: {
    allowedOrigins: [
      appUrl,
      // Convex deployment origins (needed for CORS on auth HTTP actions)
      siteUrl,
      siteUrl.replace('.convex.site', '.convex.cloud'),
    ],
  },
})

export default http

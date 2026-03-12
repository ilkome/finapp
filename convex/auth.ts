import type { GenericCtx } from '@convex-dev/better-auth'

import { createClient } from '@convex-dev/better-auth'
import { convex, crossDomain } from '@convex-dev/better-auth/plugins'
import { betterAuth } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/plugins'

import type { DataModel } from './_generated/dataModel'

import { components } from './_generated/api'
import authConfig from './auth.config'

const siteUrl = process.env.CONVEX_SITE_URL!
const appUrl = process.env.APP_URL || 'http://localhost:3050'

export const authComponent = createClient<DataModel>(components.betterAuth)

function createAuth(ctx: GenericCtx<DataModel>) {
  return betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        // The convex plugin only sets disableRefresh for /get-session.
        // /convex/token also uses sessionMiddleware → getSession() internally,
        // but without disableRefresh the session refresh can fail in cross-domain
        // context (HTTP action can't reliably persist refreshed cookies) → 401.
        // IMPORTANT: only return { context } for /convex/token — returning it
        // for all paths would interfere with the convex plugin's own disableRefresh
        // hook for /get-session (defu merge conflict).
        if (ctx.path === '/convex/token') {
          ctx.query = { ...ctx.query, disableRefresh: 'true' }
          return { context: ctx }
        }
      }),
    },
    account: {
      encryptOAuthTokens: true,
    },
    plugins: [
      convex({
        authConfig,
        jwksRotateOnTokenGenerationError: true,
      }),
      crossDomain({
        siteUrl: appUrl,
      }),
    ],
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24, // 1 day (refresh on each visit)
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    trustedOrigins: [appUrl],
  })
}

export { createAuth }

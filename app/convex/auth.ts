import type { GenericCtx } from '@convex-dev/better-auth'

import { createClient } from '@convex-dev/better-auth'
import { convex, crossDomain } from '@convex-dev/better-auth/plugins'
import { betterAuth } from 'better-auth'

import type { DataModel } from './_generated/dataModel'

import { components } from './_generated/api'
import authConfig from './auth.config'

const siteUrl = process.env.CONVEX_SITE_URL!
const appUrl = process.env.APP_URL!

export const authComponent = createClient<DataModel>(components.betterAuth)

function createAuth(ctx: GenericCtx<DataModel>) {
  return betterAuth({
    account: {
      encryptOAuthTokens: true,
    },
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    onAPIError: {
      errorURL: `${appUrl}/login`,
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

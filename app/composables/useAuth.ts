import { crossDomainClient } from '@convex-dev/better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'

let authClient: ReturnType<typeof createAuthClient> | null = null

export function useAuth() {
  if (!authClient) {
    const config = useRuntimeConfig()
    const siteUrl = config.public.convexSiteUrl as string

    authClient = createAuthClient({
      baseURL: siteUrl,
      plugins: [
        crossDomainClient(),
      ],
    })
  }

  return authClient
}

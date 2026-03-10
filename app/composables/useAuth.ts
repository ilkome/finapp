import { convexClient, crossDomainClient } from '@convex-dev/better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'

function createClient(siteUrl: string) {
  return createAuthClient({
    baseURL: siteUrl,
    plugins: [
      convexClient(),
      crossDomainClient(),
    ],
  })
}

type AuthClient = ReturnType<typeof createClient>

export function useAuth(): AuthClient {
  const nuxtApp = useNuxtApp() as { _authClient?: AuthClient } & ReturnType<typeof useNuxtApp>

  if (!nuxtApp._authClient) {
    const config = useRuntimeConfig()
    const siteUrl = config.public.convexSiteUrl as string
    nuxtApp._authClient = createClient(siteUrl)
  }

  return nuxtApp._authClient
}

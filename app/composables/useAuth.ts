import { crossDomainClient } from '@convex-dev/better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'

type AuthClient = ReturnType<typeof createAuthClient>

export function useAuth(): AuthClient {
  const nuxtApp = useNuxtApp() as { _authClient?: AuthClient } & ReturnType<typeof useNuxtApp>

  if (!nuxtApp._authClient) {
    const config = useRuntimeConfig()
    const siteUrl = config.public.convexSiteUrl as string

    nuxtApp._authClient = createAuthClient({
      baseURL: siteUrl,
      plugins: [
        crossDomainClient(),
      ],
    })
  }

  return nuxtApp._authClient
}

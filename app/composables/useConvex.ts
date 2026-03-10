import type { ConvexClient } from 'convex/browser'

import { api } from '~~/convex/_generated/api'

export function useConvexClient(): ConvexClient {
  const { $convex } = useNuxtApp()
  return $convex as ConvexClient
}

export function useConvexClientWithApi() {
  return {
    api,
    client: useConvexClient(),
  }
}

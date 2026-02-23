import type { ConvexClient, ConvexHttpClient } from 'convex/browser'

import { api } from '~~/convex/_generated/api'

export function useConvexClient(): ConvexClient | ConvexHttpClient {
  const { $convex } = useNuxtApp()
  return $convex as ConvexClient | ConvexHttpClient
}

export function useConvexClientComposable(): ConvexClient {
  return useConvexClient() as ConvexClient
}

export function useConvexClientWithApi() {
  return {
    api,
    client: useConvexClientComposable(),
  }
}

import { ConvexClient } from 'convex/browser'

let clientInstance: ConvexClient | null = null

export function createConvexClient(url: string): ConvexClient {
  if (!clientInstance)
    clientInstance = new ConvexClient(url)
  return clientInstance
}

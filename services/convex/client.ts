import { ConvexClient, ConvexHttpClient } from 'convex/browser'

let clientInstance: ConvexClient | null = null
let httpClientInstance: ConvexHttpClient | null = null

export function createConvexClient(url: string): ConvexClient {
  if (!clientInstance)
    clientInstance = new ConvexClient(url)
  return clientInstance
}

export function createConvexHttpClient(url: string): ConvexHttpClient {
  if (!httpClientInstance)
    httpClientInstance = new ConvexHttpClient(url)
  return httpClientInstance
}

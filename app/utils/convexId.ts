import type { GenericId } from 'convex/values'
import type { TableNames } from '~~/convex/_generated/dataModel'

export function asConvexId<T extends TableNames>(id: string): GenericId<T> {
  return id as unknown as GenericId<T>
}

export function isLocalId(id: string): boolean {
  return id.startsWith('local_')
}

/**
 * Remove stale frontend-generated IDs from data.
 * Keeps IDs that are in the pending offline queue (awaiting creation).
 */
export function cleanupFrontendIds<T>(
  data: Record<string, T>,
  pendingUpdates: Record<string, T>,
): Record<string, T> {
  const result = { ...data }
  for (const id of Object.keys(result)) {
    if (isLocalId(id) && !pendingUpdates[id])
      delete result[id]
  }
  return result
}

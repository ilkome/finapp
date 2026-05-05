import { v } from 'convex/values'

import type { MutationCtx } from './_generated/server'

import { internal } from './_generated/api'
import { internalAction, internalMutation } from './_generated/server'

export type TombstoneEntity = 'categories' | 'trns' | 'wallets'

const RETAIN_MS = 30 * 24 * 60 * 60 * 1000

export const purgeOldPage = internalMutation({
  args: { cursor: v.union(v.string(), v.null()), cutoff: v.number() },
  handler: async (ctx, { cursor, cutoff }) => {
    const page = await ctx.db
      .query('tombstones')
      .withIndex('by_user_deletedAt')
      .paginate({ cursor, numItems: 500 })

    let removed = 0
    for (const t of page.page) {
      if (t.deletedAt < cutoff) {
        await ctx.db.delete(t._id)
        removed++
      }
    }
    return { continueCursor: page.continueCursor, isDone: page.isDone, removed }
  },
})

export const purgeOld = internalAction({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - RETAIN_MS
    let cursor: string | null = null
    let isDone = false
    let total = 0
    while (!isDone) {
      const result: { continueCursor: string, isDone: boolean, removed: number } = await ctx.runMutation(
        internal.tombstones.purgeOldPage,
        { cursor, cutoff },
      )
      total += result.removed
      cursor = result.continueCursor
      isDone = result.isDone
    }
    return { removed: total }
  },
})

export async function emitTombstone(
  ctx: MutationCtx,
  userId: string,
  entity: TombstoneEntity,
  entityId: string,
): Promise<void> {
  await ctx.db.insert('tombstones', {
    deletedAt: Date.now(),
    entity,
    entityId,
    userId,
  })
}

export async function emitTombstones(
  ctx: MutationCtx,
  userId: string,
  entity: TombstoneEntity,
  entityIds: string[],
): Promise<void> {
  if (entityIds.length === 0)
    return
  const deletedAt = Date.now()
  for (const entityId of entityIds)
    await ctx.db.insert('tombstones', { deletedAt, entity, entityId, userId })
}

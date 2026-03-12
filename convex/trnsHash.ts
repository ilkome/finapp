import { v } from 'convex/values'

import type { MutationCtx } from './_generated/server'

import { internal } from './_generated/api'
import { internalAction, internalMutation } from './_generated/server'

// Duplicate: also in utils/fnv1a.ts (Convex has its own bundler, can't share)
export function fnv1aNum(str: string): number {
  let hash = 0x811C9DC5
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export async function getOrCreateSyncMeta(ctx: MutationCtx, userId: string) {
  const existing = await ctx.db
    .query('syncMeta')
    .withIndex('by_user', q => q.eq('userId', userId))
    .first()
  if (existing)
    return existing
  const id = await ctx.db.insert('syncMeta', { userId })
  return (await ctx.db.get(id))!
}

// XOR is symmetric: toggling an ID in = adding, toggling it out = removing.
export async function toggleTrnHash(ctx: MutationCtx, userId: string, trnId: string) {
  const meta = await getOrCreateSyncMeta(ctx, userId)
  const current = meta.trnsIdsHash ? Number.parseInt(meta.trnsIdsHash, 36) : 0
  const updated = (current ^ fnv1aNum(trnId)) >>> 0
  await ctx.db.patch(meta._id, { trnsIdsHash: updated.toString(36) })
}

export async function toggleTrnsHash(ctx: MutationCtx, userId: string, trnIds: string[]) {
  if (trnIds.length === 0)
    return
  const meta = await getOrCreateSyncMeta(ctx, userId)
  let hash = meta.trnsIdsHash ? Number.parseInt(meta.trnsIdsHash, 36) : 0
  for (const id of trnIds)
    hash = (hash ^ fnv1aNum(id)) >>> 0
  await ctx.db.patch(meta._id, { trnsIdsHash: hash.toString(36) })
}

export const recalcHashPage = internalMutation({
  args: {
    cursor: v.union(v.string(), v.null()),
    runningHash: v.number(),
    userId: v.string(),
  },
  handler: async (ctx, { cursor, runningHash, userId }) => {
    const page = await ctx.db
      .query('trns')
      .withIndex('by_user', q => q.eq('userId', userId))
      .paginate({ cursor, numItems: 5000 })

    let hash = runningHash
    for (const t of page.page)
      hash = (hash ^ fnv1aNum(t._id)) >>> 0

    if (page.isDone) {
      const meta = await getOrCreateSyncMeta(ctx, userId)
      await ctx.db.patch(meta._id, { trnsIdsHash: hash.toString(36) })
      return { isDone: true as const }
    }

    return {
      continueCursor: page.continueCursor,
      hash,
      isDone: false as const,
    }
  },
})

export const recalcHashForUser = internalAction({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    let cursor: string | null = null
    let hash = 0

    while (true) {
      const result: { isDone: true } | { continueCursor: string, hash: number, isDone: false }
        = await ctx.runMutation(internal.trnsHash.recalcHashPage, {
          cursor,
          runningHash: hash,
          userId,
        })

      if (result.isDone)
        break

      cursor = result.continueCursor
      hash = result.hash
    }
  },
})

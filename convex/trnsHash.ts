import type { MutationCtx } from './_generated/server'

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

export async function addTrnToHash(ctx: MutationCtx, userId: string, trnId: string) {
  const meta = await getOrCreateSyncMeta(ctx, userId)
  const current = meta.trnsIdsHash ? Number.parseInt(meta.trnsIdsHash, 36) : 0
  const updated = (current ^ fnv1aNum(trnId)) >>> 0
  await ctx.db.patch(meta._id, { trnsIdsHash: updated.toString(36) })
}

export async function removeTrnFromHash(ctx: MutationCtx, userId: string, trnId: string) {
  await addTrnToHash(ctx, userId, trnId)
}

export async function addTrnsToHash(ctx: MutationCtx, userId: string, trnIds: string[]) {
  if (trnIds.length === 0)
    return
  const meta = await getOrCreateSyncMeta(ctx, userId)
  let hash = meta.trnsIdsHash ? Number.parseInt(meta.trnsIdsHash, 36) : 0
  for (const id of trnIds)
    hash = (hash ^ fnv1aNum(id)) >>> 0
  await ctx.db.patch(meta._id, { trnsIdsHash: hash.toString(36) })
}

export async function removeTrnsFromHash(ctx: MutationCtx, userId: string, trnIds: string[]) {
  await addTrnsToHash(ctx, userId, trnIds)
}

export async function recalcTrnsHash(ctx: MutationCtx, userId: string) {
  let hash = 0
  let isDone = false
  let cursor: string | null = null

  while (!isDone) {
    const page = await ctx.db
      .query('trns')
      .withIndex('by_user', q => q.eq('userId', userId))
      .paginate({ cursor, numItems: 5000 })
    for (const t of page.page)
      hash = (hash ^ fnv1aNum(t._id)) >>> 0
    isDone = page.isDone
    cursor = page.continueCursor
  }

  const meta = await getOrCreateSyncMeta(ctx, userId)
  await ctx.db.patch(meta._id, { trnsIdsHash: hash.toString(36) })
}

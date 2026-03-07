import { v } from 'convex/values'

import { components, internal } from './_generated/api'
import { internalAction, internalMutation } from './_generated/server'
import { TrnType } from './shared'
import { addTrnsToHash, fnv1aNum, getOrCreateSyncMeta } from './trnsHash'

export const deleteTablePage = internalMutation({
  args: {
    table: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { table, userId }) => {
    const page = await ctx.db
      .query(table as 'categories' | 'wallets' | 'trns' | 'userSettings' | 'syncMeta')
      .withIndex('by_user', q => q.eq('userId', userId))
      .paginate({ cursor: null, numItems: 500 })
    for (const row of page.page)
      await ctx.db.delete(row._id)
    return { count: page.page.length, hasMore: !page.isDone }
  },
})

export const deleteUserData = internalAction({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    const tables = ['categories', 'wallets', 'trns', 'userSettings', 'syncMeta'] as const
    const counts: Record<string, number> = {}

    for (const table of tables) {
      let total = 0
      let hasMore = true
      while (hasMore) {
        const result = await ctx.runMutation(internal.migrate.deleteTablePage, { table, userId })
        total += result.count
        hasMore = result.hasMore
      }
      counts[table] = total
      if (total > 0)
        console.log(`deleted ${total} rows from ${table}`)
    }

    console.log('deleteUserData: done', counts)
    return counts
  },
})

export const deleteAuthTablePage = internalMutation({
  args: {
    model: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { model, userId }) => {
    const field = model === 'user' ? '_id' : 'userId'
    const result = await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
      input: {
        model: model as any,
        where: [{ field, operator: 'eq', value: userId }],
      },
      paginationOpts: { cursor: null, numItems: 500 },
    })
    return { count: result?.deletedCount ?? 0 }
  },
})

export const deleteUserDataFull = internalAction({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    // Delete app tables
    const appResult = await ctx.runAction(internal.migrate.deleteUserData, { userId })
    console.log('App data deleted:', appResult)

    // Delete auth tables
    const authTables = ['session', 'account', 'twoFactor', 'passkey', 'oauthApplication', 'oauthAccessToken', 'oauthConsent', 'user']
    for (const model of authTables) {
      const result = await ctx.runMutation(internal.migrate.deleteAuthTablePage, { model, userId })
      if (result.count > 0)
        console.log(`Deleted ${result.count} rows from auth:${model}`)
    }

    console.log('deleteUserDataFull: done for', userId)
  },
})

export const insertWallets = internalMutation({
  args: {
    userId: v.string(),
    wallets: v.any(),
  },
  handler: async (ctx, { userId, wallets }) => {
    const idMap: Record<string, string> = {}
    for (const { oldId, ...data } of wallets) {
      const id = await ctx.db.insert('wallets', { ...data, userId })
      idMap[oldId] = id
    }
    return idMap
  },
})

export const insertCategories = internalMutation({
  args: {
    categories: v.any(),
    userId: v.string(),
  },
  handler: async (ctx, { categories, userId }) => {
    const idMap: Record<string, string> = {}
    const inserts: Array<{ id: string, oldParentId?: string }> = []

    for (const { oldChildIds: _oldChildIds, oldId, oldParentId, ...data } of categories) {
      const id = await ctx.db.insert('categories', { ...data, userId })
      idMap[oldId] = id
      inserts.push({ id, oldParentId })
    }

    for (const { id, oldParentId } of inserts) {
      if (oldParentId && idMap[oldParentId]) {
        await ctx.db.patch(id as any, { parentId: idMap[oldParentId] })
      }
    }

    return idMap
  },
})

export const insertTrnsBatch = internalMutation({
  args: {
    trns: v.any(),
    userId: v.string(),
  },
  handler: async (ctx, { trns, userId }) => {
    const newIds: string[] = []
    for (const data of trns) {
      const id = await ctx.db.insert('trns', { ...data, userId })
      newIds.push(id)
    }
    await addTrnsToHash(ctx, userId, newIds)
    return (trns as any[]).length
  },
})

export const insertUserSettings = internalMutation({
  args: {
    baseCurrency: v.string(),
    locale: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('userSettings', args)
  },
})

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
        = await ctx.runMutation(internal.migrate.recalcHashPage, {
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

// --- Migrate old transfers to adjustment ---
// Old transfers have categoryId: 'transfer' with type: Expense(0) or Income(1).
// Modern transfers use type: Transfer(2). Old transfers are semantically adjustments.

export const migrateOldTransfersPage = internalMutation({
  args: {
    cursor: v.union(v.string(), v.null()),
  },
  handler: async (ctx, { cursor }) => {
    const page = await ctx.db
      .query('trns')
      .paginate({ cursor, numItems: 500 })

    let patched = 0
    for (const trn of page.page) {
      if (trn.categoryId === 'transfer' && (trn.type === TrnType.Expense || trn.type === TrnType.Income)) {
        await ctx.db.patch(trn._id, { categoryId: 'adjustment' })
        patched++
      }
    }

    return {
      continueCursor: page.continueCursor,
      hasMore: !page.isDone,
      patched,
    }
  },
})

export const migrateOldTransfers = internalAction({
  args: {},
  handler: async (ctx) => {
    let cursor: string | null = null
    let totalPatched = 0

    while (true) {
      const result: { continueCursor: string, hasMore: boolean, patched: number }
        = await ctx.runMutation(internal.migrate.migrateOldTransfersPage, { cursor })
      totalPatched += result.patched

      if (!result.hasMore)
        break

      cursor = result.continueCursor
    }

    console.log(`migrateOldTransfers: patched ${totalPatched} transactions`)
    return totalPatched
  },
})

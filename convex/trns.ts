import { paginationOptsValidator } from 'convex/server'
import { v } from 'convex/values'

import type { Id } from './_generated/dataModel'
import type { MutationCtx } from './_generated/server'

import { internal } from './_generated/api'
import { mutation, query } from './_generated/server'
import { getAuthUser, getOwnEntity, requireAuthUser, TrnType } from './shared'
import { addTrnToHash, fnv1aNum, removeTrnFromHash, removeTrnsFromHash } from './trnsHash'

async function validateTrnFields(ctx: MutationCtx, args: Record<string, any>, userId: string) {
  if (args.type === TrnType.Transfer) {
    if (!args.expenseWalletId || !args.incomeWalletId)
      throw new Error('Transfer requires both wallets')
    if (args.expenseWalletId === args.incomeWalletId)
      throw new Error('Transfer wallets must be different')
    if (!args.expenseAmount || args.expenseAmount <= 0)
      throw new Error('Transfer expense amount must be positive')
    if (!args.incomeAmount || args.incomeAmount <= 0)
      throw new Error('Transfer income amount must be positive')
    await Promise.all([
      getOwnEntity(ctx, args.expenseWalletId as Id<'wallets'>, userId, 'Expense wallet not found'),
      getOwnEntity(ctx, args.incomeWalletId as Id<'wallets'>, userId, 'Income wallet not found'),
    ])
  }
  else {
    if (!args.amount || args.amount <= 0)
      throw new Error('Amount must be positive')
    if (!args.walletId)
      throw new Error('Wallet is required')
    if (!args.categoryId)
      throw new Error('Category is required')
    if (args.categoryId === 'transfer')
      throw new Error('categoryId "transfer" is only allowed for Transfer type')
    await getOwnEntity(ctx, args.walletId as Id<'wallets'>, userId, 'Wallet not found')
    if (args.categoryId !== 'adjustment')
      await getOwnEntity(ctx, args.categoryId as Id<'categories'>, userId, 'Category not found')
  }
}

const trnTypeValidator = v.union(
  v.literal(TrnType.Expense),
  v.literal(TrnType.Income),
  v.literal(TrnType.Transfer),
)

export const delta = query({
  args: { paginationOpts: paginationOptsValidator, since: v.number() },
  handler: async (ctx, { paginationOpts, since }) => {
    const user = await getAuthUser(ctx)
    if (!user)
      return null
    return ctx.db
      .query('trns')
      .withIndex('by_user_updatedAt', q =>
        q.eq('userId', user._id).gt('updatedAt', since))
      .paginate(paginationOpts)
  },
})

export const ensureSyncMeta = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuthUser(ctx)
    const existing = await ctx.db
      .query('syncMeta')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .first()
    if (existing?.trnsIdsHash)
      return
    await ctx.scheduler.runAfter(0, internal.migrate.recalcHashForUser, { userId: user._id })
  },
})

export const idsHash = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx)
    if (!user)
      return null
    const serverTime = Date.now()
    const meta = await ctx.db
      .query('syncMeta')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .first()
    if (meta?.trnsIdsHash)
      return { hash: meta.trnsIdsHash, serverTime }
    // Fallback: compute XOR hash via pagination (before syncMeta row exists)
    let hash = 0
    let isDone = false
    let cursor: string | null = null
    while (!isDone) {
      const page = await ctx.db
        .query('trns')
        .withIndex('by_user', q => q.eq('userId', user._id))
        .paginate({ cursor, numItems: 5000 })
      for (const t of page.page)
        hash = (hash ^ fnv1aNum(t._id)) >>> 0
      isDone = page.isDone
      cursor = page.continueCursor
    }
    return { hash: hash.toString(36), serverTime }
  },
})

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const user = await getAuthUser(ctx)
    if (!user)
      return null
    return ctx.db
      .query('trns')
      .withIndex('by_user_date', q => q.eq('userId', user._id))
      .order('desc')
      .paginate(paginationOpts)
  },
})

export const create = mutation({
  args: {
    amount: v.optional(v.number()),
    categoryId: v.optional(v.union(v.id('categories'), v.literal('transfer'), v.literal('adjustment'))),
    date: v.number(),
    desc: v.optional(v.string()),
    expenseAmount: v.optional(v.number()),
    expenseWalletId: v.optional(v.id('wallets')),
    incomeAmount: v.optional(v.number()),
    incomeWalletId: v.optional(v.id('wallets')),
    type: trnTypeValidator,
    walletId: v.optional(v.id('wallets')),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx)
    await validateTrnFields(ctx, args, user._id)
    const id = await ctx.db.insert('trns', {
      ...args,
      updatedAt: Date.now(),
      userId: user._id,
    })
    await addTrnToHash(ctx, user._id, id)
    return id
  },
})

export const update = mutation({
  args: {
    amount: v.optional(v.number()),
    categoryId: v.optional(v.union(v.id('categories'), v.literal('transfer'), v.literal('adjustment'))),
    date: v.optional(v.number()),
    desc: v.optional(v.string()),
    expenseAmount: v.optional(v.number()),
    expenseWalletId: v.optional(v.id('wallets')),
    id: v.id('trns'),
    incomeAmount: v.optional(v.number()),
    incomeWalletId: v.optional(v.id('wallets')),
    type: v.optional(trnTypeValidator),
    walletId: v.optional(v.id('wallets')),
  },
  handler: async (ctx, { id, ...args }) => {
    const user = await requireAuthUser(ctx)
    const trn = await getOwnEntity(ctx, id, user._id)
    await validateTrnFields(ctx, { ...trn, ...args }, user._id)

    const patch: Record<string, any> = { ...args, updatedAt: Date.now() }

    // Clear stale fields when type changes to prevent orphaned index entries
    if (args.type !== undefined && args.type !== trn.type) {
      if (args.type === TrnType.Transfer) {
        patch.walletId = undefined
        patch.amount = undefined
        if (!args.categoryId)
          patch.categoryId = 'transfer'
      }
      else {
        patch.expenseWalletId = undefined
        patch.incomeWalletId = undefined
        patch.expenseAmount = undefined
        patch.incomeAmount = undefined
      }
    }

    await ctx.db.patch(id, patch)
  },
})

async function removeUserTrn(ctx: MutationCtx, id: Id<'trns'>, userId: string): Promise<boolean> {
  const trn = await ctx.db.get(id)
  if (trn && trn.userId === userId) {
    await ctx.db.delete(id)
    return true
  }
  return false
}

export const remove = mutation({
  args: { id: v.id('trns') },
  handler: async (ctx, { id }) => {
    const user = await requireAuthUser(ctx)
    const deleted = await removeUserTrn(ctx, id, user._id)
    if (deleted)
      await removeTrnFromHash(ctx, user._id, id)
  },
})

const BATCH_LIMIT = 500

export const removeBatch = mutation({
  args: { ids: v.array(v.id('trns')) },
  handler: async (ctx, { ids }) => {
    if (ids.length > BATCH_LIMIT)
      throw new Error(`Batch size exceeds limit of ${BATCH_LIMIT}`)

    const user = await requireAuthUser(ctx)
    const deletedIds: string[] = []
    for (const id of ids) {
      const deleted = await removeUserTrn(ctx, id, user._id)
      if (deleted)
        deletedIds.push(id)
    }
    if (deletedIds.length)
      await removeTrnsFromHash(ctx, user._id, deletedIds)
  },
})

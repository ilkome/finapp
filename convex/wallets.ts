import { v } from 'convex/values'

import { internal } from './_generated/api'
import { action, internalMutation, mutation, query } from './_generated/server'
import { getAuthUser, getOwnEntity, requireAuthUser, walletTypeValidator } from './shared'
import { removeTrnsFromHash } from './trnsHash'

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx)
    if (!user)
      return null
    return await ctx.db
      .query('wallets')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .collect()
  },
})

export const create = mutation({
  args: {
    color: v.string(),
    creditLimit: v.optional(v.number()),
    currency: v.string(),
    desc: v.optional(v.string()),
    isArchived: v.optional(v.boolean()),
    isExcludeInTotal: v.optional(v.boolean()),
    isWithdrawal: v.optional(v.boolean()),
    name: v.string(),
    order: v.number(),
    type: walletTypeValidator,
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx)
    if (!args.name.trim())
      throw new Error('Name is required')
    if (!args.color.trim())
      throw new Error('Color is required')
    if (!args.currency.trim())
      throw new Error('Currency is required')
    return await ctx.db.insert('wallets', {
      ...args,
      isArchived: args.isArchived ?? false,
      isExcludeInTotal: args.isExcludeInTotal ?? false,
      isWithdrawal: args.isWithdrawal ?? false,
      updatedAt: Date.now(),
      userId: user._id,
    })
  },
})

export const update = mutation({
  args: {
    color: v.optional(v.string()),
    creditLimit: v.optional(v.number()),
    currency: v.optional(v.string()),
    desc: v.optional(v.string()),
    id: v.id('wallets'),
    isArchived: v.optional(v.boolean()),
    isExcludeInTotal: v.optional(v.boolean()),
    isWithdrawal: v.optional(v.boolean()),
    name: v.optional(v.string()),
    order: v.optional(v.number()),
    type: v.optional(walletTypeValidator),
  },
  handler: async (ctx, { id, ...args }) => {
    const user = await requireAuthUser(ctx)
    if (args.name !== undefined && !args.name.trim())
      throw new Error('Name is required')
    if (args.color !== undefined && !args.color.trim())
      throw new Error('Color is required')
    if (args.currency !== undefined && !args.currency.trim())
      throw new Error('Currency is required')
    await getOwnEntity(ctx, id, user._id)
    await ctx.db.patch(id, { ...args, updatedAt: Date.now() })
  },
})

export const updateOrder = mutation({
  args: {
    orders: v.array(v.object({
      id: v.id('wallets'),
      order: v.number(),
    })),
  },
  handler: async (ctx, { orders }) => {
    const user = await requireAuthUser(ctx)
    for (const { id, order } of orders) {
      await getOwnEntity(ctx, id, user._id)
      await ctx.db.patch(id, { order, updatedAt: Date.now() })
    }
  },
})

export const removeTrnsByWalletPage = internalMutation({
  args: {
    cursor: v.union(v.string(), v.null()),
    indexName: v.union(
      v.literal('by_user_wallet'),
      v.literal('by_user_expenseWallet'),
      v.literal('by_user_incomeWallet'),
    ),
    userId: v.string(),
    walletId: v.id('wallets'),
  },
  handler: async (ctx, { cursor, indexName, userId, walletId }) => {
    const page = await ctx.db
      .query('trns')
      .withIndex(indexName, q => q.eq('userId', userId).eq(
        indexName === 'by_user_wallet' ? 'walletId' : indexName === 'by_user_expenseWallet' ? 'expenseWalletId' : 'incomeWalletId',
        walletId,
      ))
      .paginate({ cursor, numItems: 500 })

    const deletedIds: string[] = []
    for (const trn of page.page) {
      await ctx.db.delete(trn._id)
      deletedIds.push(trn._id)
    }

    if (deletedIds.length)
      await removeTrnsFromHash(ctx, userId, deletedIds)

    return { continueCursor: page.continueCursor, isDone: page.isDone }
  },
})

export const removeWalletFinalize = internalMutation({
  args: {
    userId: v.string(),
    walletId: v.id('wallets'),
  },
  handler: async (ctx, { userId, walletId }) => {
    const wallet = await ctx.db.get(walletId)
    if (wallet && wallet.userId === userId)
      await ctx.db.delete(walletId)
  },
})

export const remove = action({
  args: { id: v.id('wallets') },
  handler: async (ctx, { id }) => {
    const user = await ctx.runQuery(internal.userSettings.getCurrentUser)
    if (!user)
      throw new Error('Unauthorized')

    const indexes = ['by_user_wallet', 'by_user_expenseWallet', 'by_user_incomeWallet'] as const
    for (const indexName of indexes) {
      let cursor: string | null = null
      let isDone = false
      while (!isDone) {
        const result = await ctx.runMutation(internal.wallets.removeTrnsByWalletPage, {
          cursor,
          indexName,
          userId: user._id,
          walletId: id,
        })
        isDone = result.isDone
        cursor = result.continueCursor
      }
    }

    await ctx.runMutation(internal.wallets.removeWalletFinalize, {
      userId: user._id,
      walletId: id,
    })
  },
})

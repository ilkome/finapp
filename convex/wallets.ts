import { v } from 'convex/values'

import { mutation, query } from './_generated/server'
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

export const remove = mutation({
  args: { id: v.id('wallets') },
  handler: async (ctx, { id }) => {
    const user = await requireAuthUser(ctx)
    const userId = user._id
    await getOwnEntity(ctx, id, userId)

    const deletedIds: string[] = []
    const deletedSet = new Set<string>()

    // Paginated helper to delete trns by index
    async function deleteTrnsByIndex(indexName: 'by_user_wallet' | 'by_user_expenseWallet' | 'by_user_incomeWallet', fieldValue: typeof id) {
      let cursor: string | null = null
      let isDone = false
      while (!isDone) {
        const page = await ctx.db
          .query('trns')
          .withIndex(indexName, q => q.eq('userId', userId).eq(
            indexName === 'by_user_wallet' ? 'walletId' : indexName === 'by_user_expenseWallet' ? 'expenseWalletId' : 'incomeWalletId',
            fieldValue,
          ))
          .paginate({ cursor, numItems: 500 })
        for (const trn of page.page) {
          if (deletedSet.has(trn._id))
            continue
          await ctx.db.delete(trn._id)
          deletedIds.push(trn._id)
          deletedSet.add(trn._id)
        }
        isDone = page.isDone
        cursor = page.continueCursor
      }
    }

    // Delete regular trns and transfers referencing this wallet
    await deleteTrnsByIndex('by_user_wallet', id)
    await deleteTrnsByIndex('by_user_expenseWallet', id)
    await deleteTrnsByIndex('by_user_incomeWallet', id)

    await ctx.db.delete(id)

    if (deletedIds.length)
      await removeTrnsFromHash(ctx, userId, deletedIds)
  },
})

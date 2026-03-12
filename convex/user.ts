import { v } from 'convex/values'

import { internal } from './_generated/api'
import { action, internalQuery, mutation, query } from './_generated/server'
import { getAuthUser, requireAuthUser, validateStringLength } from './shared'

export const get = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx)
    if (!user)
      return null
    return await ctx.db
      .query('userSettings')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .first()
  },
})

export const upsert = mutation({
  args: {
    baseCurrency: v.optional(v.string()),
    locale: v.optional(v.union(v.literal('en'), v.literal('ru'))),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx)

    if (args.baseCurrency !== undefined && !args.baseCurrency.trim())
      throw new Error('Base currency is required')
    validateStringLength(args.baseCurrency, 10, 'Base currency')

    const existing = await ctx.db
      .query('userSettings')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, args)
      return existing._id
    }

    return await ctx.db.insert('userSettings', {
      baseCurrency: args.baseCurrency ?? 'USD',
      locale: args.locale,
      userId: user._id,
    })
  },
})

export const removeAllUserData = action({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.user.getCurrentUser)
    if (!user)
      throw new Error('Unauthorized')
    await ctx.runAction(internal.migrate.deleteUserData, { userId: user._id })
  },
})

export const getCurrentUser = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await getAuthUser(ctx)
  },
})

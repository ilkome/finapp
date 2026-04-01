import { v } from 'convex/values'

import { internal } from './_generated/api'
import { internalAction, internalMutation, query } from './_generated/server'

const RATES_API_URL = 'https://openexchangerates.org/api/latest.json'
const appId = process.env.OPEN_EXCHANGE_RATES_KEY

export const getLatest = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('rates')
      .withIndex('by_date')
      .order('desc')
      .first()
  },
})

export const saveRates = internalMutation({
  args: {
    date: v.string(),
    rates: v.record(v.string(), v.number()),
  },
  handler: async (ctx, { date, rates }) => {
    const existing = await ctx.db
      .query('rates')
      .withIndex('by_date', q => q.eq('date', date))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, { rates, updatedAt: Date.now() })
    }
    else {
      await ctx.db.insert('rates', { date, rates, updatedAt: Date.now() })
    }
  },
})

export const fetchAndSaveRates = internalAction({
  args: {},
  handler: async (ctx) => {
    if (!appId) {
      console.error('OPEN_EXCHANGE_RATES_KEY not set')
      return
    }

    const res = await fetch(
      `${RATES_API_URL}?app_id=${appId}`,
    )

    if (!res.ok) {
      console.error(`Rates fetch failed: ${res.status} ${res.statusText}`)
      return
    }

    const data = await res.json()
    const today = new Date().toISOString().slice(0, 10)

    await ctx.runMutation(internal.rates.saveRates, {
      date: today,
      rates: data.rates,
    })
  },
})

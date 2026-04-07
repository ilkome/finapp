import { v } from 'convex/values'

import { internal } from './_generated/api'
import { internalAction, internalMutation, query } from './_generated/server'

const OER_API_URL = 'https://openexchangerates.org/api/latest.json'
const COINBASE_API_URL = 'https://api.coinbase.com/v2/exchange-rates'

async function fetchFromCoinbase(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch(`${COINBASE_API_URL}?currency=USD`)

    if (!res.ok) {
      console.error(`Coinbase fetch failed: ${res.status} ${res.statusText}`)
      return null
    }

    const json = await res.json()
    const rawRates: Record<string, string> = json.data?.rates

    if (!rawRates) {
      console.error('Coinbase: unexpected response shape')
      return null
    }

    const parsed: Record<string, number> = {}
    for (const [code, value] of Object.entries(rawRates)) {
      const num = Number.parseFloat(value)
      if (Number.isFinite(num) && num > 0) {
        parsed[code] = num
      }
    }

    return parsed
  }
  catch (e) {
    console.error('Coinbase fetch error:', e)
    return null
  }
}

async function fetchFromOER(): Promise<Record<string, number> | null> {
  const appId = process.env.OPEN_EXCHANGE_RATES_KEY

  if (!appId) {
    console.error('OPEN_EXCHANGE_RATES_KEY not set')
    return null
  }

  try {
    const res = await fetch(`${OER_API_URL}?app_id=${appId}`)

    if (!res.ok) {
      console.error(`OER fetch failed: ${res.status} ${res.statusText}`)
      return null
    }

    const data = await res.json()
    return data.rates ?? null
  }
  catch (e) {
    console.error('OER fetch error:', e)
    return null
  }
}

export const getLatest = query({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db
      .query('rates')
      .withIndex('by_date')
      .order('desc')
      .take(4)

    if (records.length === 0)
      return null

    // Merge: newest first, first-seen currency wins
    const merged: Record<string, number> = {}

    for (const record of records) {
      for (const [currency, rate] of Object.entries(record.rates)) {
        if (!(currency in merged)) {
          merged[currency] = rate
        }
      }
    }

    return {
      date: records[0]!.date,
      rates: merged,
      updatedAt: records[0]!.updatedAt,
    }
  },
})

export const saveRates = internalMutation({
  args: {
    date: v.string(),
    rates: v.record(v.string(), v.number()),
    source: v.string(),
  },
  handler: async (ctx, { date, rates, source }) => {
    const existing = await ctx.db
      .query('rates')
      .withIndex('by_date_source', q => q.eq('date', date).eq('source', source))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, { rates, updatedAt: Date.now() })
    }
    else {
      await ctx.db.insert('rates', { date, rates, source, updatedAt: Date.now() })
    }
  },
})

export const fetchAndSaveRates = internalAction({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().slice(0, 10)

    // Coinbase (primary — no API key, ~960 currencies incl. crypto)
    const coinbaseRates = await fetchFromCoinbase()
    if (coinbaseRates) {
      await ctx.runMutation(internal.rates.saveRates, {
        date: today,
        rates: coinbaseRates,
        source: 'coinbase',
      })
      console.log(`Coinbase: saved ${Object.keys(coinbaseRates).length} rates`)
    }

    // OER (secondary — better fiat precision, ~173 currencies)
    const oerRates = await fetchFromOER()
    if (oerRates) {
      await ctx.runMutation(internal.rates.saveRates, {
        date: today,
        rates: oerRates,
        source: 'oer',
      })
      console.log(`OER: saved ${Object.keys(oerRates).length} rates`)
    }

    if (!coinbaseRates && !oerRates) {
      console.error('All exchange rate sources failed')
    }
  },
})

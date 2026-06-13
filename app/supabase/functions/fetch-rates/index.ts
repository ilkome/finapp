// Daily exchange-rate refresh.
//
// Pulls two USD-based sources, merges them into one map and writes a single
// `source = 'merged'` row into `public.rates`:
//   - Coinbase: no API key, ~all fiat + crypto. Used as the base layer.
//   - OER (Open Exchange Rates): better fiat precision. Overlaid on top.
//
// The client reads ONE row (`... ORDER BY date DESC LIMIT 1`), so we merge here
// and persist a single row per day rather than merging at read time.
//
// Writes use the service_role (auto-injected as SUPABASE_SERVICE_ROLE_KEY):
// `rates` has a global read policy but no client INSERT policy.

import { createClient } from 'jsr:@supabase/supabase-js@2'

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
      if (Number.isFinite(num) && num > 0)
        parsed[code] = num
    }

    return parsed
  }
  catch (e) {
    console.error('Coinbase fetch error:', e)
    return null
  }
}

async function fetchFromOER(): Promise<Record<string, number> | null> {
  const appId = Deno.env.get('OPEN_EXCHANGE_RATES_KEY')

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

Deno.serve(async () => {
  const date = new Date().toISOString().slice(0, 10)

  const [coinbase, oer] = await Promise.all([fetchFromCoinbase(), fetchFromOER()])

  if (!coinbase && !oer) {
    console.error('All exchange rate sources failed')
    return new Response(JSON.stringify({ error: 'all sources failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Base: Coinbase (broad + crypto). Overlay: OER fiat (more precise). Both USD-based.
  const merged: Record<string, number> = { ...(coinbase ?? {}), ...(oer ?? {}) }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // The (date, source) unique index is on an expression (coalesce(source,'')),
  // which PostgREST upsert can't target - so select-then-write.
  const { data: existing, error: selErr } = await supabase
    .from('rates')
    .select('id')
    .eq('date', date)
    .eq('source', 'merged')
    .maybeSingle()

  if (selErr) {
    console.error('rates select failed:', selErr)
    return new Response(JSON.stringify({ error: selErr.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const writeErr = existing
    ? (await supabase
        .from('rates')
        .update({ rates: merged, updatedAt: Date.now() })
        .eq('id', existing.id)).error
    : (await supabase
        .from('rates')
        .insert({ date, source: 'merged', rates: merged, updatedAt: Date.now() })).error

  if (writeErr) {
    console.error('rates write failed:', writeErr)
    return new Response(JSON.stringify({ error: writeErr.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const summary = {
    date,
    count: Object.keys(merged).length,
    coinbase: coinbase ? Object.keys(coinbase).length : 0,
    oer: oer ? Object.keys(oer).length : 0,
  }
  console.log('rates saved:', summary)
  return new Response(JSON.stringify(summary), {
    headers: { 'Content-Type': 'application/json' },
  })
})

import type { Row } from '~~/services/powersync/transforms'

import localforage from 'localforage'
import { defineStore } from 'pinia'
import { getPowerSyncDb, watchTable } from '~~/services/powersync/db'
import { rowToRates } from '~~/services/powersync/transforms'
import { civilDayKey } from '~~/utils/date/civil'

import type { CurrencyCode, Rates } from '~/components/currencies/types'

import { createToBase, getAmountInRate } from '~/components/amount/getTotal'
import { useDemo } from '~/components/demo/useDemo'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { useUserStore } from '~/components/user/useUserStore'
import { persistStoreCache } from '~/composables/useStoreCache'
import { isPersistBlocked } from '~/composables/useStoreSync'
import { createLogger } from '~/utils/logger'

const logger = createLogger('currencies')

export const useCurrenciesStore = defineStore('currencies', () => {
  const userStore = useUserStore()
  const { isDemo } = useDemo()

  const base = computed(() => userStore.baseCurrency)
  const rates = ref<Rates>({})

  let watchController: AbortController | null = null

  /** Real mode: subscribe to the latest rates row in local SQLite. */
  function initCurrencies(): void {
    if (isDemo.value)
      return

    watchController?.abort()
    watchController = watchTable<Row>('SELECT * FROM rates ORDER BY date DESC LIMIT 1', [], (rows) => {
      const r = rows[0] ? rowToRates(rows[0]) : null
      if (r)
        setRates(r)
    })
    logger.log('watching rates')
  }

  function setRates(values: Rates) {
    rates.value = values

    if (isPersistBlocked())
      return
    // Demo keeps its own localforage key; real mode mirrors rates into the cold-start snapshot.
    if (isDemo.value)
      localforage.setItem(STORAGE_KEYS.currencies, { rates: values })
    else
      persistStoreCache('rates', toRaw(values)) // plain copy - IndexedDB can't clone a Vue proxy
  }

  /** Cold-start paint: seed rates from the per-user snapshot before the rates watch emits. */
  function primeFromCache(data: Rates | null): void {
    if (isDemo.value || !data || Object.keys(rates.value).length)
      return
    rates.value = data
  }

  const reportedMissing = new Set<CurrencyCode>()
  /** For totals: `undefined` when loaded rates lack the currency, see `createToBase`. */
  const tryToBase = createToBase(() => base.value, () => rates.value, {
    isDev: import.meta.dev,
    onMissing(currency) {
      if (reportedMissing.has(currency))
        return
      reportedMissing.add(currency)
      logger.error('missing rate', currency)
    },
  })

  /** A missing rate counts as 0, never 1:1. */
  function toBase(amount: number, currencyCode: CurrencyCode): number {
    return tryToBase(amount, currencyCode) ?? 0
  }

  function fromBase(amount: number, currencyCode: CurrencyCode): number {
    return getAmountInRate(amount, base.value, currencyCode, rates.value)
  }

  /** Rates of the civil day `date` or the closest day before it; `null` when the synced history starts later. Demo keeps no history. */
  async function getRatesOn(date: number): Promise<Rates | null> {
    if (isDemo.value)
      return null

    const db = await getPowerSyncDb()
    const row = await db.getOptional<Row>('SELECT * FROM rates WHERE date <= ? ORDER BY date DESC LIMIT 1', [civilDayKey(date)])
    return row ? rowToRates(row) : null
  }

  /**
   * `getRatesOn` for many civil days with one query: each entry is the rates of that day or the
   * closest day before it, `null` before the synced history. Only the picked rows are parsed.
   */
  async function getRatesOnDates(dates: number[]): Promise<(Rates | null)[]> {
    if (isDemo.value || !dates.length)
      return dates.map(() => null)

    const keys = dates.map(civilDayKey)
    const db = await getPowerSyncDb()
    const rows = await db.getAll<{ date: string, rates: string }>('SELECT date, rates FROM rates WHERE date <= ? ORDER BY date', [keys.reduce((a, b) => a > b ? a : b)])
    const parsed = new Map<number, Rates | null>()
    return keys.map((key) => {
      // Binary search for the last row not after the key.
      let lo = 0
      let hi = rows.length - 1
      let found = -1
      while (lo <= hi) {
        const mid = (lo + hi) >> 1
        if (rows[mid]!.date <= key) {
          found = mid
          lo = mid + 1
        }
        else {
          hi = mid - 1
        }
      }
      if (found < 0)
        return null
      if (!parsed.has(found))
        parsed.set(found, rowToRates(rows[found] as unknown as Row))
      return parsed.get(found)!
    })
  }

  return {
    base,
    fromBase,
    getRatesOn,
    getRatesOnDates,
    initCurrencies,
    primeFromCache,
    rates,
    setRates,
    toBase,
    tryToBase,
  }
})

import type { Row } from '~~/services/powersync/transforms'
import type { ManualRate } from '~~/utils/money/convert'

import localforage from 'localforage'
import { defineStore } from 'pinia'
import { itemToRow, rowToItem } from '~~/services/powersync/columns'
import { getPowerSyncDb, watchTable } from '~~/services/powersync/db'
import { deleteRow, upsertRow } from '~~/services/powersync/mutations'
import { rowToRates } from '~~/services/powersync/transforms'
import { applyManualRates } from '~~/utils/money/convert'

import type { CurrencyCode, CurrencyItem, Rates } from '~/components/currencies/types'

import { createToBase, getAmountInRate } from '~/components/amount/getTotal'
import { setUserCurrencies } from '~/components/amount/utils'
import { currencyItemSchema, isBuiltInCurrency } from '~/components/currencies/types'
import { useDemo } from '~/components/demo/useDemo'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { useUserStore } from '~/components/user/useUserStore'
import { resolveWriteUid } from '~/composables/useAuthSession'
import { persistStoreCache } from '~/composables/useStoreCache'
import { isPersistBlocked, persistOptimistic } from '~/composables/useStoreSync'
import { useSupabaseAuth } from '~/composables/useSupabase'
import { createLogger } from '~/utils/logger'

const logger = createLogger('currencies')

/** Rows the schema rejects are skipped, so one bad row does not hide the others. */
export function parseItems(values: unknown[]): Record<CurrencyCode, CurrencyItem> {
  return Object.fromEntries(values.flatMap((value) => {
    const parsed = currencyItemSchema.safeParse(value)
    return parsed.success ? [[parsed.data.code, parsed.data]] : []
  }))
}

export const useCurrenciesStore = defineStore('currencies', () => {
  const userStore = useUserStore()
  const { isDemo } = useDemo()

  const { uid } = useSupabaseAuth()

  const base = computed(() => userStore.baseCurrency)
  const marketRates = shallowRef<Rates>({})
  /** Civil day of the market rates; null before they load and in demo. */
  const ratesDate = ref<number | null>(null)
  /** The user's custom currencies and edits of built-in ones, by code. */
  const items = shallowRef<Record<CurrencyCode, CurrencyItem>>({})

  const manualRates = computed<Record<CurrencyCode, ManualRate>>(() => Object.fromEntries(Object.values(items.value)
    .flatMap(c => c.manualRate && c.manualRateCurrencyCode ? [[c.code, { currencyCode: c.manualRateCurrencyCode, rate: c.manualRate }]] : [])))

  /** Market rates with the user's manual rates applied: what every conversion uses. */
  const rates = computed<Rates>(() => applyManualRates(marketRates.value, manualRates.value) as Rates)

  let watchController: AbortController | null = null
  let userCurrenciesWatch: AbortController | null = null

  /** Real mode: subscribe to the latest rates row in local SQLite. */
  function initCurrencies(): void {
    if (isDemo.value)
      return

    watchController?.abort()
    watchController = watchTable<Row>('SELECT * FROM exchange_rates ORDER BY date DESC LIMIT 1', [], (rows) => {
      const r = rows[0] ? rowToRates(rows[0]) : null
      if (r) {
        ratesDate.value = Number(rows[0]!.date) || null
        setRates(r)
      }
    })
    logger.log('watching rates')

    // The user's own currencies and edits of built-in ones; a built-in without a row is used as the list has it.
    userCurrenciesWatch?.abort()
    userCurrenciesWatch = watchTable<Row>('SELECT * FROM currencies', [], (rows) => {
      setItems(parseItems(rows.map(row => rowToItem('currencies', row))))
    })
  }

  function persistDemo() {
    if (!isPersistBlocked())
      localforage.setItem(STORAGE_KEYS.currencies, { items: toRaw(items.value), rates: toRaw(marketRates.value) })
  }

  function setRates(values: Rates) {
    marketRates.value = values

    if (isPersistBlocked())
      return
    // Demo keeps its own localforage key; real mode mirrors rates into the cold-start snapshot.
    if (isDemo.value)
      persistDemo()
    else
      persistStoreCache('rates', toRaw(values)) // plain copy - IndexedDB can't clone a Vue proxy
  }

  function setItems(values: Record<CurrencyCode, CurrencyItem>) {
    items.value = values
    setUserCurrencies(new Map(Object.entries(values)))
    if (isDemo.value)
      persistDemo()
    else if (!isPersistBlocked())
      persistStoreCache('currencies', values)
  }

  /** Cold-start paint: seed rates and currencies from the per-user snapshot before the watches emit. */
  function primeFromCache(data: Rates | null, currencies?: unknown): void {
    if (isDemo.value)
      return
    if (data && !Object.keys(marketRates.value).length)
      marketRates.value = data
    if (currencies && !Object.keys(items.value).length) {
      const parsed = parseItems(Object.values(currencies as object))
      items.value = parsed
      setUserCurrencies(new Map(Object.entries(parsed)))
    }
  }

  /** Saves a custom currency or an edit of a built-in one; an edit that changes nothing deletes the row ("Reset"). */
  function saveCurrency(item: CurrencyItem) {
    const now = Date.now()
    const value = { ...item, createdAt: items.value[item.code]?.createdAt ?? now, updatedAt: now }
    const isEmptyEdit = isBuiltInCurrency(item.code)
      && [item.name, item.symbol, item.minorDisplay, item.manualRate].every(v => v === undefined)
    return isEmptyEdit ? deleteCurrency(item.code) : write(item.code, { ...items.value, [item.code]: value }, value)
  }

  function deleteCurrency(code: CurrencyCode) {
    const next = { ...items.value }
    delete next[code]
    return write(code, next, null)
  }

  function write(code: CurrencyCode, next: Record<CurrencyCode, CurrencyItem>, value: CurrencyItem | null) {
    const prev = items.value
    setItems(next)
    if (isDemo.value)
      return Promise.resolve(true)

    const userId = resolveWriteUid(uid.value)
    const rowId = `${userId}:${code}`
    return persistOptimistic(value ? upsertRow('currencies', rowId, itemToRow('currencies', { ...value, userId })) : deleteRow('currencies', rowId), {
      errorKey: 'currencies.errors.saveFailed',
      label: 'saveCurrency',
      logger,
      rollback: () => setItems(prev),
    })
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

  // Exposed as constant getters, not actions: Pinia wraps every function a store returns in an action
  // (arguments copied, two Sets, subscribers called), which costs more than the conversion it wraps,
  // and totals convert every transaction.
  const toBaseFn = computed(() => toBase)
  const tryToBaseFn = computed(() => tryToBase)

  function fromBase(amount: number, currencyCode: CurrencyCode): number {
    return getAmountInRate(amount, base.value, currencyCode, rates.value)
  }

  /** Past rates price the user's custom currencies the same way as today's. */
  function withManualRates(values: Rates | null): Rates | null {
    return values && applyManualRates(values, manualRates.value) as Rates
  }

  /** Rates of the civil day `date` or the closest day before it; `null` when the synced history starts later. Demo keeps no history. */
  async function getRatesOn(date: number): Promise<Rates | null> {
    if (isDemo.value)
      return null

    const db = await getPowerSyncDb()
    const row = await db.getOptional<Row>('SELECT * FROM exchange_rates WHERE date <= ? ORDER BY date DESC LIMIT 1', [date])
    return withManualRates(row ? rowToRates(row) : null)
  }

  /**
   * `getRatesOn` for many civil days with one query: each entry is the rates of that day or the
   * closest day before it, `null` before the synced history. Only the picked rows are parsed.
   */
  async function getRatesOnDates(dates: number[]): Promise<(Rates | null)[]> {
    if (isDemo.value || !dates.length)
      return dates.map(() => null)

    const keys = dates
    const db = await getPowerSyncDb()
    const rows = await db.getAll<{ date: number, rates: string }>('SELECT date, rates FROM exchange_rates WHERE date <= ? ORDER BY date', [Math.max(...keys)])
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
        parsed.set(found, withManualRates(rowToRates(rows[found] as unknown as Row)))
      return parsed.get(found)!
    })
  }

  return {
    base,
    deleteCurrency,
    fromBase,
    getRatesOn,
    getRatesOnDates,
    initCurrencies,
    items,
    manualRates,
    primeFromCache,
    rates,
    ratesDate,
    saveCurrency,
    setItems,
    setRates,
    toBase: toBaseFn,
    tryToBase: tryToBaseFn,
  }
})

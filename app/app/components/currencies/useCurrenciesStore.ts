import type { Row } from '~~/services/powersync/transforms'

import localforage from 'localforage'
import { defineStore } from 'pinia'
import { watchTable } from '~~/services/powersync/db'
import { rowToRates } from '~~/services/powersync/transforms'

import type { Rates } from '~/components/currencies/types'

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

  return {
    base,
    initCurrencies,
    primeFromCache,
    rates,
    setRates,
  }
})

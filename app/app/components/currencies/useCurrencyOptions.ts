import type { CurrencyCode } from '~/components/currencies/types'

import { currencies } from '~/components/currencies/currencies'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useCurrencyName } from '~/components/currencies/useCurrencyName'
import { orderCurrencies } from '~/components/currencies/utils'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

/** Every currency the user can pick (built-in and custom), named and in picker order (`orderCurrencies`). */
export function useCurrencyOptions() {
  const currenciesStore = useCurrenciesStore()
  const walletsStore = useWalletsStore()
  const { getCurrencyName } = useCurrencyName()

  const walletCurrencies = computed(() => {
    const result: Record<CurrencyCode, { count: number, total: number }> = {}
    for (const [id, wallet] of Object.entries(walletsStore.items ?? {})) {
      const entry = result[wallet.currencyCode] ??= { count: 0, total: 0 }
      entry.count++
      entry.total += Math.abs(currenciesStore.toBase(walletsStore.itemsComputed[id]?.amount ?? 0, wallet.currencyCode))
    }
    return result
  })

  const options = computed(() => {
    const own = Object.keys(currenciesStore.items)
    const codes = orderCurrencies([...currencies.map(c => c.code), ...own, ...walletsStore.currenciesUsed], walletCurrencies.value, new Set(own))
    return codes.map(code => ({ code, name: getCurrencyName(code) }))
  })

  return { getCurrencyName, options, walletCurrencies }
}

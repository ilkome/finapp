import dayjs from 'dayjs'
import data from '~/components/demo/data'
import currencies from '~/components/demo/currencies.json'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useInitApp } from '~/components/app/useInitApp'
import type { Trns } from '~/components/trns/types'

const config = {
  amount: 100000,
  subtractYears: 2,
  trnsCount: 1000,
}

export function useDemo() {
  async function loadDemoData() {
    const { clearLocalData } = useInitApp()
    const currenciesStore = useCurrenciesStore()
    const walletsStore = useWalletsStore()
    const categoriesStore = useCategoriesStore()
    const trnsStore = useTrnsStore()

    await clearLocalData()

    currenciesStore.setBase('USD')
    currenciesStore.setRates(currencies)
    categoriesStore.setCategories(data.categories)
    walletsStore.setWallets(data.wallets)

    const startDate = dayjs().startOf('year').subtract(config.subtractYears, 'year').valueOf()
    const endDate = dayjs()

    const trns: Trns = [...Array(config.trnsCount)].reduce((acc, _, i) => {
      return {
        ...acc,
        [i]: {
          amount: Math.floor(Math.random() * config.amount) + 1,
          categoryId: categoriesStore.getTransactibleIds2()[Math.floor(Math.random() * categoriesStore.getTransactibleIds2().length)],
          date: startDate.valueOf() + Math.random() * (endDate.valueOf() - startDate.valueOf()),
          id: i,
          type: Math.random() < 0.5 ? 0 : 1,
          walletId: walletsStore.sortedIds[Math.floor(Math.random() * walletsStore.sortedIds.length)],
        },
      }
    }, {})

    trnsStore.setTrns(trns)
  }

  return {
    loadDemoData,
  }
}

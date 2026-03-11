import { startOfYear, subYears } from 'date-fns'
import localforage from 'localforage'

import type { Categories } from '~/components/categories/types'
import type { LocaleSlug } from '~/components/locale/types'
import type { Trns } from '~/components/trns/types'
import type { Wallets } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import currencies from '~/components/demo/currencies.json'
import { data } from '~/components/demo/data'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUserStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const config = {
  amount: 100000,
  subtractYears: 2,
  trnsCount: 1000,
}

export function useDemo() {
  const isDemo = useCookie('finapp.isDemo')
  const categoriesStore = useCategoriesStore()
  const currenciesStore = useCurrenciesStore()
  const walletsStore = useWalletsStore()
  const trnsStore = useTrnsStore()

  async function generateDemoData(locale: LocaleSlug) {
    await localforage.clear()

    const translatedData: {
      categories: Categories
      wallets: Wallets
    } = {
      categories: Object.entries(data.categories).reduce((acc, [id, category]) => {
        acc[id] = { ...category, name: category.name[locale] }
        return acc
      }, {} as Categories),
      wallets: Object.entries(data.wallets).reduce((acc, [id, wallet]) => {
        acc[id] = { ...wallet, desc: wallet.desc[locale], name: wallet.name[locale] } as Wallets[string]
        return acc
      }, {} as Wallets),
    }

    useUserStore().setUserBaseCurrency('USD')
    currenciesStore.setRates(currencies)
    categoriesStore.setCategories(translatedData.categories)
    walletsStore.setWallets(translatedData.wallets)

    const startDate = subYears(startOfYear(new Date()), config.subtractYears).getTime()
    const endDate = new Date().getTime()

    const transactibleIds = categoriesStore.getTransactibleIds()
    const walletIds = walletsStore.sortedIds

    const trns: Trns = Array.from({ length: config.trnsCount }).reduce<Trns>((acc, _, i) => {
      acc[i] = {
        amount: Math.floor(Math.random() * config.amount) + 1,
        categoryId: transactibleIds[Math.floor(Math.random() * transactibleIds.length)]!,
        date: startDate + Math.random() * (endDate - startDate),
        type: Math.random() < 0.5 ? 0 : 1,
        updatedAt: Date.now(),
        walletId: walletIds[Math.floor(Math.random() * walletIds.length)]!,
      }
      return acc
    }, {})

    trnsStore.setTrns(trns)
  }

  return {
    generateDemoData,
    isDemo,
  }
}

// import { useInitApp } from '~/components/app/useInitApp'
import localforage from 'localforage'
import { startOfYear, subYears } from 'date-fns'
import currencies from '~/components/demo/currencies.json'
import data from '~/components/demo/data'
import type { AddCategoryParams, CategoryId } from '~/components/categories/types'
import type { TrnId, Trns } from '~/components/trns/types'
import type { WalletId, WalletItem, Wallets } from '~/components/wallets/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
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

  async function generateDemoData() {
    // const { clearLocalData } = useInitApp()

    localforage.clear()
    // await clearLocalData()

    currenciesStore.setBase('USD')
    currenciesStore.setRates(currencies)
    categoriesStore.setCategories(data.categories)
    walletsStore.setWallets(data.wallets)

    const startDate = subYears(startOfYear(new Date()), config.subtractYears).getTime()
    const endDate = new Date().getTime()

    const trns: Trns = [...Array(config.trnsCount)].reduce((acc, _, i) => {
      return {
        ...acc,
        [i]: {
          amount: Math.floor(Math.random() * config.amount) + 1,
          categoryId: categoriesStore.getTransactibleIds()[Math.floor(Math.random() * categoriesStore.getTransactibleIds().length)],
          date: startDate + Math.random() * (endDate - startDate),
          id: i,
          type: Math.random() < 0.5 ? 0 : 1,
          walletId: walletsStore.sortedIds[Math.floor(Math.random() * walletsStore.sortedIds.length)],
        },
      }
    }, {})

    trnsStore.setTrns(trns)
  }

  function addDemoCategory({ childIds, id, isUpdateChildCategoriesColor, values }: AddCategoryParams) {
    const items = {
      ...categoriesStore.items,
      [id]: values,
    }

    if (isUpdateChildCategoriesColor && childIds) {
      for (const childId of childIds) {
        if (items[childId]) {
          items[childId].color = values.color
        }
      }
    }
    categoriesStore.setCategories(items)
  }

  async function deleteDemoCategory(id: CategoryId, trnsIds?: TrnId[]) {
    if (trnsIds)
      await deleteDemoTrns(trnsIds)

    const items = { ...categoriesStore.items }
    delete items[id]

    categoriesStore.setCategories(items)
  }

  async function deleteDemoTrns(ids: TrnId[]) {
    const trns = { ...trnsStore.items }
    for (const id of ids)
      delete trns[id]

    await trnsStore.setTrns(trns)
  }

  async function sortDemoWallets(ids: WalletId[], wallets: Wallets) {
    const sortedWallets = ids.reduce((acc, walletId, index) => {
      const wallet = wallets[walletId]
      acc[walletId] = wallet
      acc[walletId].order = index
      return acc
    }, {} as Record<WalletId, WalletItem>)

    walletsStore.setWallets(sortedWallets)
    return 'ok'
  }

  return {
    addDemoCategory,
    deleteDemoCategory,
    deleteDemoTrns,
    generateDemoData,
    isDemo,
    sortDemoWallets,
  }
}

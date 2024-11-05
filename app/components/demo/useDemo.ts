import dayjs from 'dayjs'
import localforage from 'localforage'
import { deepUnref } from 'vue-deepunref'
import currencies from '~/components/demo/currencies.json'
import data from '~/components/demo/data'
import type { AddCategoryParams, CategoryId } from '~/components/categories/types'
import type { TrnId, Trns } from '~/components/trns/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useInitApp } from '~/components/app/useInitApp'
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
    const { clearLocalData } = useInitApp()

    localforage.clear()
    // await clearLocalData()

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
          categoryId: categoriesStore.getTransactibleIds()[Math.floor(Math.random() * categoriesStore.getTransactibleIds().length)],
          date: startDate.valueOf() + Math.random() * (endDate.valueOf() - startDate.valueOf()),
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

  return {
    addDemoCategory,
    deleteDemoCategory,
    deleteDemoTrns,
    generateDemoData,
    isDemo,
  }
}

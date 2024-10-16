import data from '~/components/demo/data.json'
import currencies from '~/components/demo/currencies.json'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUser'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useInitApp } from '~/components/app/useInitApp'

export function useDemo() {
  const { clearLocalData } = useInitApp()
  const currenciesStore = useCurrenciesStore()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()

  async function loadDemoData() {
    await clearLocalData()
    currenciesStore.setBase('USD')
    currenciesStore.setRates(currencies)
    categoriesStore.setCategories(data.categories)
    walletsStore.setWallets(data.wallets)
    trnsStore.setTrns(data.trns)
  }

  return {
    loadDemoData,
  }
}

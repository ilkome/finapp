import localforage from 'localforage'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUser'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export function useInitApp() {
  const userStore = useUserStore()
  const currenciesStore = useCurrenciesStore()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()

  async function loadAppFromCache() {
    const [user, currencies, categories, wallets, trns] = await Promise.all([
      localforage.getItem('finapp.user'),
      localforage.getItem('finapp.currencies'),
      localforage.getItem('finapp.categories'),
      localforage.getItem('finapp.wallets'),
      localforage.getItem('finapp.trns'),
    ])

    userStore.setUser(user)
    currenciesStore.setBase(currencies?.base)
    currenciesStore.setRates(currencies?.rates)
    walletsStore.setWallets(wallets)
    categoriesStore.setCategories(categories)
    trnsStore.setTrns(trns)
  }

  function clearLocalData() {
    categoriesStore.setCategories(null)
    trnsStore.setTrns(null)
    walletsStore.setWallets(null)
    userStore.setUser(null)
  }

  function loadAppFromDB() {
    try {
      currenciesStore.initCurrencies()
      categoriesStore.initCategories()
      walletsStore.initWallets()
      trnsStore.initTrns()
      trnsStore.uploadOfflineTrns()
    }
    catch (e) {
      console.error(e)
    }
  }

  return {
    clearLocalData,
    loadAppFromCache,
    loadAppFromDB,
  }
}

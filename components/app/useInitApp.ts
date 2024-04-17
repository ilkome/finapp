import { onAuthStateChanged } from 'firebase/auth'
import localforage from 'localforage'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUser'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { auth } from '~/services/firebase/api'
import useUIView from '~/components/layout/useUIView'

export function useInitApp() {
  const { setUI } = useUIView()
  const userStore = useUserStore()
  const currenciesStore = useCurrenciesStore()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()

  function clearUserData() {
    categoriesStore.setCategories(null)
    trnsStore.setTrns(null)
    walletsStore.setWallets(null)
    userStore.setUser(null)
  }

  function initApp() {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        clearUserData()
        return
      }

      try {
        if (userStore.uid !== user.uid)
          clearUserData()

        userStore.setUser(user)
        currenciesStore.initCurrencies()
        // categoriesStore.initCategories()
        // walletsStore.initWallets()
        // trnsStore.initTrns()
        trnsStore.uploadOfflineTrns()

        if (useRoute().name === 'login')
          navigateTo('/')
      }
      catch (e) {
        console.error(e)
      }
    })
  }

  async function initAppFromCache() {
    const [user, currencies, categories, wallets, trns, ui] = await Promise.all([
      localforage.getItem('finapp.user'),
      localforage.getItem('finapp.currencies'),
      localforage.getItem('finapp.categories'),
      localforage.getItem('finapp.wallets'),
      localforage.getItem('finapp.trns'),
      localforage.getItem('finapp.ui'),
    ])

    // console.log('user', user)
    // console.log('currencies', currencies)
    // console.log('categories', categories)
    // console.log('wallets', wallets)
    // console.log('trns', trns)
    // console.log('filterPeriod', filterPeriod)

    user && userStore.setUser(user)
    currencies && currenciesStore.setBase(currencies.base)
    currencies && currenciesStore.setRates(currencies.rates)
    wallets && walletsStore.setWallets(wallets)
    categories && categoriesStore.setCategories(categories)
    trns && trnsStore.setTrns(trns)

    if (ui) {
      for (const slug in ui)
        setUI({ name: slug, value: ui[slug] })
    }

    // ready
    if (categories && user && trns && wallets) {
      if (useRoute().name === 'login')
        navigateTo('/')
    }
  }

  async function init() {
    await initAppFromCache()
    await initApp()
  }

  return {
    init,
  }
}

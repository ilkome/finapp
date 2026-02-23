import localforage from 'localforage'

import type { LocaleSlug } from '~/components/locale/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { setOfflineQueueUserId } from '~/components/offline/helpers'
import { replayOfflineQueue } from '~/components/offline/replay'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUserStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { blockPersist, unblockPersist } from '~/composables/useStoreSync'
import { createLogger } from '~/utils/logger'

const isDbLoading = ref(false)

export function useInitApp() {
  const userStore = useUserStore()
  const currenciesStore = useCurrenciesStore()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()

  async function loadDataFromCache() {
    const [user, userSettings, currencies, categories, wallets, trns] = await Promise.all([
      localforage.getItem(STORAGE_KEYS.user),
      localforage.getItem<{ baseCurrency?: string, locale?: LocaleSlug }>(STORAGE_KEYS.userSettings),
      localforage.getItem(STORAGE_KEYS.currencies),
      localforage.getItem(STORAGE_KEYS.categories),
      localforage.getItem(STORAGE_KEYS.wallets),
      localforage.getItem(STORAGE_KEYS.trns),
    ])

    userStore.setUser(user)
    if (userSettings?.baseCurrency)
      userStore.setUserBaseCurrency(userSettings.baseCurrency)
    if (userSettings?.locale)
      userStore.setUserLocale(userSettings.locale)
    currenciesStore.setRates(currencies?.rates)
    walletsStore.setWallets(wallets)
    categoriesStore.setCategories(categories)
    trnsStore.setTrns(trns)
  }

  function clearLocalData() {
    // Block all persist operations — prevents in-flight store inits, mutation callbacks,
    // and debounced persists from re-writing data after cleanup.
    blockPersist()

    categoriesStore.cancelPersist()
    trnsStore.cancelPersist()
    walletsStore.cancelPersist()

    categoriesStore.setCategories(null)
    trnsStore.setTrns(null)
    walletsStore.setWallets(null)
    userStore.setUser(null)

    // Clear cached data from localforage to prevent data leaks on shared devices.
    // The offline queue is intentionally preserved — it has its own userId ownership check.
    for (const key of Object.values(STORAGE_KEYS))
      localforage.removeItem(key)
  }

  async function loadDataFromDB() {
    // Unblock persists — may have been blocked by a prior clearLocalData
    unblockPersist()

    // Set in-memory userId for queue ownership stamping during pushes
    setOfflineQueueUserId(userStore.uid)

    isDbLoading.value = true
    try {
      await Promise.all([
        userStore.initUserSettings(),
        currenciesStore.initCurrencies(),
        categoriesStore.initCategories(),
        walletsStore.initWallets(),
        trnsStore.initTrns(),
      ])

      await replayOfflineQueue()
    }
    catch (e) {
      createLogger('app').error('loadDataFromDB failed', e)
    }
    finally {
      isDbLoading.value = false
    }
  }

  return {
    clearLocalData,
    isDbLoading,
    loadDataFromCache,
    loadDataFromDB,
  }
}

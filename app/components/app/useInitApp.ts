import localforage from 'localforage'

import type { Categories } from '~/components/categories/types'
import type { Trns } from '~/components/trns/types'
import type { User } from '~/components/user/useUserStore'
import type { Wallets } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { ratesSchema } from '~/components/currencies/types'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { setOfflineQueueUserId } from '~/components/offline/helpers'
import { replayOfflineQueue } from '~/components/offline/replay'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { userSettingsSchema } from '~/components/user/types'
import { useUserStore } from '~/components/user/useUserStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { blockPersist, unblockPersist } from '~/composables/useStoreSync'
import { createLogger } from '~/utils/logger'

export function useInitApp() {
  const isDbLoading = ref(false)
  const isOffline = ref(false)
  const userStore = useUserStore()
  const currenciesStore = useCurrenciesStore()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()

  // Sync data when coming back online
  useEventListener(window, 'online', () => {
    isOffline.value = false
    if (userStore.uid && !isDbLoading.value)
      loadDataFromDB()
  })

  useEventListener(window, 'offline', () => {
    isOffline.value = true
  })

  async function loadDataFromCache() {
    const [user, rawUserSettings, rawCurrencies, categories, wallets, trns] = await Promise.all([
      localforage.getItem<User | null>(STORAGE_KEYS.user),
      localforage.getItem(STORAGE_KEYS.userSettings),
      localforage.getItem<{ rates?: unknown }>(STORAGE_KEYS.currencies),
      localforage.getItem<Categories | null>(STORAGE_KEYS.categories),
      localforage.getItem<Wallets | null>(STORAGE_KEYS.wallets),
      localforage.getItem<Trns | null>(STORAGE_KEYS.trns),
    ])

    userStore.setUser(user ?? null)

    const userSettings = userSettingsSchema.safeParse(rawUserSettings)
    if (userSettings.success) {
      userStore.setUserBaseCurrency(userSettings.data.baseCurrency)
      if (userSettings.data.locale)
        userStore.setUserLocale(userSettings.data.locale)
    }

    const rates = ratesSchema.safeParse(rawCurrencies?.rates)
    if (rates.success)
      currenciesStore.setRates(rates.data)

    walletsStore.setWallets(wallets ?? null)
    categoriesStore.setCategories(categories ?? null)
    trnsStore.setTrns(trns ?? null)
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

    // Wait for Convex auth token to be fetched so queries run authenticated.
    // Without this, queries can fire before setAuth's token fetch completes.
    const { $waitForConvexAuth } = useNuxtApp()
    await ($waitForConvexAuth as () => Promise<void>)()

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
    isOffline,
    loadDataFromCache,
    loadDataFromDB,
  }
}

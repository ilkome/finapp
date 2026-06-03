import localforage from 'localforage'
import { connectPowerSync, getLocalDbOwner, waitForFirstSync } from '~~/services/powersync/db'

import type { Categories } from '~/components/categories/types'
import type { Rates } from '~/components/currencies/types'
import type { Trns } from '~/components/trns/types'
import type { User, UserSettingsCache } from '~/components/user/useUserStore'
import type { Wallets } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { ratesSchema } from '~/components/currencies/types'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useDemo } from '~/components/demo/useDemo'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { userSettingsSchema } from '~/components/user/types'
import { useUserStore } from '~/components/user/useUserStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { getPersistedUid } from '~/composables/useAuthSession'
import { clearStoreCache, readStoreCache } from '~/composables/useStoreCache'
import { blockPersist, unblockPersist } from '~/composables/useStoreSync'
import { useSupabase } from '~/composables/useSupabase'
import { createLogger } from '~/utils/logger'

const logger = createLogger('app')

// Module-level singletons: every useInitApp() caller (layout, dashboard, guard) observes the same flags.
const isDbLoading = ref(false)
const isOffline = ref(false)

export function useInitApp() {
  const userStore = useUserStore()
  const currenciesStore = useCurrenciesStore()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()

  // True once all three data stores have received their first local-SQLite watch emission (even
  // an empty one) - the real "local data is on screen" signal the onboarding gate waits on. Demo
  // mode loads synchronously, so it's always ready.
  const isHydrated = computed(() =>
    useDemo().isDemo.value
    || (walletsStore.isLoaded && categoriesStore.isLoaded && trnsStore.isLoaded))

  useEventListener(window, 'online', () => {
    isOffline.value = false
    // PowerSync reconnects on its own; re-arming watches is cheap and idempotent.
    if (userStore.uid && !isDbLoading.value)
      startWatches()
  })

  useEventListener(window, 'offline', () => {
    isOffline.value = true
  })

  /**
   * Register reactive watches on local SQLite. Each watch emits current local rows immediately
   * and again on every incoming sync. Idempotent: each store aborts its previous watch first.
   */
  function startWatches() {
    userStore.initUserSettings()
    currenciesStore.initCurrencies()
    categoriesStore.initCategories()
    walletsStore.initWallets()
    trnsStore.initTrns()
  }

  // Instant first paint: seed the stores from the last session's per-user snapshot while
  // PowerSync's db.init + first query scan are still running. The watches then reconcile to truth.
  async function primeStoresFromCache() {
    const snap = await readStoreCache()
    if (!snap)
      return
    trnsStore.primeFromCache((snap.trns as Trns) ?? null)
    categoriesStore.primeFromCache((snap.categories as Categories) ?? null)
    walletsStore.primeFromCache((snap.wallets as Wallets) ?? null)
    userStore.primeFromCache((snap.user as UserSettingsCache) ?? null)
    currenciesStore.primeFromCache((snap.rates as Rates) ?? null)
  }

  // Demo mode keeps its own localforage-backed cache (no backend).
  async function loadDemoFromCache() {
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

  // Offline-first: local PowerSync SQLite is the only data source the UI reads. This arms the live
  // watches; their first emission fills the stores from disk. The server sync runs in the background.
  async function startLocalData() {
    unblockPersist()

    if (useDemo().isDemo.value) {
      await loadDemoFromCache()
      return
    }

    // Paint instantly from the last session's snapshot, in parallel with db.init - don't await.
    void primeStoresFromCache()

    // If local SQLite still holds another user's rows, wipe + reconnect before reading so we never
    // surface the previous user's data. Same-user path stays instant (no wait).
    const currentUid = userStore.uid ?? getPersistedUid()
    const owner = getLocalDbOwner()
    if (currentUid && owner && owner !== currentUid) {
      const config = useRuntimeConfig()
      await connectPowerSync(useSupabase(), config.public.powersyncUrl as string, currentUid)
    }

    startWatches()
  }

  // NOT a second data load - just waits for the server's first sync to land in local SQLite. Only
  // matters when local SQLite is empty/stale (fresh login, new device): holds the loading screen so
  // a returning user on a new device doesn't flash onboarding before their data lands.
  async function awaitInitialSync() {
    if (useDemo().isDemo.value)
      return

    if (!userStore.uid)
      return

    isDbLoading.value = true
    try {
      await waitForFirstSync()
    }
    catch (e) {
      logger.error('awaitInitialSync failed', e)
    }
    finally {
      isDbLoading.value = false
    }
  }

  function clearLocalData() {
    blockPersist()

    categoriesStore.setCategories(null)
    trnsStore.setTrns(null)
    walletsStore.setWallets(null)
    userStore.setUser(null)

    for (const key of Object.values(STORAGE_KEYS))
      localforage.removeItem(key)

    void clearStoreCache()
  }

  return {
    awaitInitialSync,
    clearLocalData,
    isDbLoading,
    isHydrated,
    isOffline,
    startLocalData,
  }
}

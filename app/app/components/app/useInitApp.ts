import localforage from 'localforage'
import { connectPowerSync, getLocalDbOwner, hasAnyLocalData, waitForFirstSync } from '~~/services/powersync/db'

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
const firstSyncComplete = ref(false)
const syncError = ref(false)
// Shared cookie ref so every caller reads/writes the same reactive value (per-call useCookie would not).
let hintRef: Ref<boolean> | null = null

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

  const isOnboarded = computed(() =>
    walletsStore.hasItems && categoriesStore.hasItems && trnsStore.hasItems)

  // Persisted hint so a returning user gets the app shell on the first frame, before hydration.
  hintRef ??= useCookie('finapp.isOnboarded', { default: () => false })
  const isOnboardedHint = hintRef

  // Single source of truth for the boot screen. Onboarding only once we're certain the user is
  // new (demo, or the first server sync genuinely completed) - never while data may still arrive.
  const bootState = computed<'loading' | 'error' | 'onboarding' | 'ready'>(() => {
    if (isOnboarded.value || isOnboardedHint.value)
      return 'ready'
    if (syncError.value)
      return 'error'
    const loaded = useDemo().isDemo.value || firstSyncComplete.value
    if (loaded && isHydrated.value && !isDbLoading.value)
      return 'onboarding'
    // TEMP: never show the loading (logo) screen - paint cached/local data immediately.
    // return 'loading'
    return 'ready'
  })

  // Hold the loading screen until the throttled watches push the freshly-synced rows into the
  // stores, so onboarding never flashes between "sync done" and "stores filled".
  function waitForStoresToReflectData(maxMs = 2000): Promise<void> {
    if (isOnboarded.value)
      return Promise.resolve()
    return new Promise((resolve) => {
      let stop = () => {}
      const timer = setTimeout(() => {
        stop()
        resolve()
      }, maxMs)
      stop = watch(isOnboarded, (ready) => {
        if (ready) {
          clearTimeout(timer)
          stop()
          resolve()
        }
      })
    })
  }

  useEventListener(window, 'online', () => {
    // PowerSync reconnects on its own; re-arming watches is cheap and idempotent.
    if (userStore.uid && !isDbLoading.value)
      startWatches()
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
    // Cold-start instrumentation: blob-cache read+prime time vs the SQLite watch path
    // (`ps:watch:*` measures) - feeds the blob-cache architecture decision.
    performance.mark('cache:prime:start')
    const snap = await readStoreCache()
    if (snap) {
      trnsStore.primeFromCache((snap.trns as Trns) ?? null)
      categoriesStore.primeFromCache((snap.categories as Categories) ?? null)
      walletsStore.primeFromCache((snap.wallets as Wallets) ?? null)
      userStore.primeFromCache((snap.user as UserSettingsCache) ?? null)
      currenciesStore.primeFromCache((snap.rates as Rates) ?? null)
    }
    performance.mark('cache:prime:end')
    performance.measure('cache:prime', 'cache:prime:start', 'cache:prime:end')
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

    // TEMP: await the cache snapshot so it's in the stores before the watches arm (otherwise an
    // empty first SQLite emission marks isLoaded and the cache prime is skipped).
    await primeStoresFromCache()

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

  // Waits for the server's first sync to land in local SQLite (fresh login / new device), holding
  // the loading screen. Sets `syncError` instead of flashing onboarding when the sync can't
  // complete and there's no local data to fall back to.
  async function awaitInitialSync() {
    if (useDemo().isDemo.value)
      return

    if (!userStore.uid)
      return

    isDbLoading.value = true
    syncError.value = false
    try {
      if (!navigator.onLine) {
        syncError.value = !(await hasAnyLocalData())
        return
      }

      const synced = await waitForFirstSync()
      if (!synced) {
        syncError.value = !(await hasAnyLocalData())
        firstSyncComplete.value = !syncError.value
        return
      }

      firstSyncComplete.value = true
      if (await hasAnyLocalData())
        await waitForStoresToReflectData()
    }
    catch (e) {
      logger.error('awaitInitialSync failed', e)
      syncError.value = !(await hasAnyLocalData().catch(() => false))
    }
    finally {
      isDbLoading.value = false
    }
  }

  // Boot the app: arm local data, then (clean login) wait for the first sync so onboarding never
  // flashes; a returning user (hint) gets the shell now and syncs in the background. Re-runnable
  // as the retry action from the error screen.
  async function initApp() {
    try {
      if (useDemo().isDemo.value) {
        if (!categoriesStore.hasItems)
          await startLocalData()
        return true
      }

      if (!(userStore.currentUser || hasPersistedSession()))
        return true

      await startLocalData()

      // TEMP: don't wait for the first real sync - sync in the background so cached/local data
      // shows immediately without the loading screen.
      // if (isOnboardedHint.value) {
      //   if (navigator.onLine)
      //     awaitInitialSync()
      // }
      // else {
      //   await awaitInitialSync()
      // }
      if (navigator.onLine)
        awaitInitialSync()
    }
    catch (e) {
      logger.error('initApp failed', e)
      syncError.value = !(await hasAnyLocalData().catch(() => false))
    }
    return true
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
    bootState,
    clearLocalData,
    initApp,
    isHydrated,
    isOnboarded,
    isOnboardedHint,
  }
}

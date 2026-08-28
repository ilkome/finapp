import type { Ref } from 'vue'

import { useStorage } from '@vueuse/core'
import { toRaw } from 'vue'
import { waitForFirstSync } from '~~/services/powersync/db'

import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { SyncableStatConfigPanelId } from '~/components/stat/views/syncPanelConfig'

import { ConfigSchema } from '~/components/stat/config/schema'
import { useUserStore } from '~/components/user/useUserStore'
import { syncPanelConfig } from '~/components/stat/views/syncPanelConfig'

import type { StatView, StatViewContext } from './types'

import { contextFingerprint, findAutomaticView } from './evaluateConditions'
import { useStatViewsStore } from './useStatViewsStore'

function cloneConfig(value: MiniItemConfig): MiniItemConfig {
  return ConfigSchema.parse(toRaw(value))
}

export function useStatViewController(config: Ref<MiniItemConfig>, context: Ref<StatViewContext>) {
  const { t } = useI18n()
  const store = useStatViewsStore()
  const userStore = useUserStore()
  const activeId = useStorage<string | null>('finapp.dashboard.statView.active', null)
  const manualFingerprint = useStorage<string | null>('finapp.dashboard.statView.manualFingerprint', null)
  const activeView = computed(() => store.views.find(view => view.id === activeId.value) ?? null)
  const configFingerprint = computed(() => JSON.stringify(config.value))
  const isDirty = computed(() => !!activeView.value && JSON.stringify(config.value) !== JSON.stringify(activeView.value.config))
  const currentFingerprint = computed(() => contextFingerprint(context.value))

  function clearActive(manual = true) {
    activeId.value = null
    if (manual)
      manualFingerprint.value = currentFingerprint.value
  }

  function apply(view: StatView, manual = true) {
    activeId.value = view.id
    config.value = cloneConfig(view.config)
    if (manual)
      manualFingerprint.value = currentFingerprint.value
  }
  function cycle() {
    const list = store.views
    if (!list.length)
      return
    if (activeId.value === null) {
      apply(list[0]!)
      return
    }
    const index = list.findIndex(view => view.id === activeId.value)
    apply(list[index < 0 || index === list.length - 1 ? 0 : index + 1]!)
  }
  async function saveAs(name: string, autoRule: StatView['autoRule'] = null, isAutoEnabled = false) {
    const view = await store.create({ autoRule, config: cloneConfig(config.value), isAutoEnabled, name, scope: 'dashboard' })
    apply(view)
    return view
  }
  async function duplicate(source: StatView) {
    const names = new Set(store.views.map(view => view.name))
    let suffix = 2
    while (names.has(`${source.name} ${suffix}`))
      suffix += 1
    const view = await store.create({
      autoRule: source.autoRule,
      config: cloneConfig(source.config),
      isAutoEnabled: source.isAutoEnabled,
      name: `${source.name} ${suffix}`,
      scope: source.scope,
    })
    apply(view)
    return view
  }
  async function updateCurrent(patch: Partial<Pick<StatView, 'autoRule' | 'isAutoEnabled' | 'name'>> = {}) {
    if (!activeView.value)
      return null
    const view = await store.update(activeView.value.id, { ...patch, config: cloneConfig(config.value) })
    return view
  }
  let configSaveQueue = Promise.resolve()
  watch(configFingerprint, () => {
    configSaveQueue = configSaveQueue
      .catch(() => undefined)
      .then(async () => {
        if (!activeView.value || !isDirty.value)
          return
        await updateCurrent()
      })
  })
  async function syncPanelAcrossViews(panel: SyncableStatConfigPanelId) {
    if (!activeView.value)
      return []
    const source = cloneConfig(config.value)
    return store.updateMany(store.views.map(view => ({
      id: view.id,
      patch: { config: syncPanelConfig(panel, source, view.config) },
    })))
  }
  function discard() {
    if (activeView.value)
      apply(activeView.value, false)
  }
  function selectForCurrentContext() {
    const automatic = findAutomaticView(store.views, context.value)
    const classic = store.views.find(view => view.name === t('stat.views.classic')) ?? store.views[0]
    const view = automatic ?? classic
    if (view)
      apply(view, false)
    return view ?? null
  }
  let isCreatingInitialView = false
  watch([
    () => store.isLoaded,
    () => userStore.isSettingsLoaded,
    () => userStore.statViewsInitialized,
  ], async ([viewsLoaded, settingsLoaded, initialized]) => {
    if (!viewsLoaded || !settingsLoaded || isCreatingInitialView || (initialized && store.views.length > 0))
      return
    isCreatingInitialView = true
    try {
      if (initialized && !store.isDemo) {
        await waitForFirstSync()
        if (store.views.length > 0)
          return
      }
      const classicName = t('stat.views.classic')
      const existing = store.views.find(view => view.name === classicName)
      const previousIds = store.views.map(view => view.id)
      const classic = existing ?? await store.create({
        autoRule: null,
        config: cloneConfig(config.value),
        isAutoEnabled: false,
        name: classicName,
        scope: 'dashboard',
      })
      if (!existing && previousIds.length)
        await store.reorder([classic.id, ...previousIds])
      await userStore.saveStatViewsInitialized()
      if (activeId.value === null)
        apply(classic, false)
    }
    finally {
      isCreatingInitialView = false
    }
  }, { immediate: true })
  watch([() => store.isLoaded, () => store.views], () => {
    if (store.isLoaded && activeId.value && !store.views.some(view => view.id === activeId.value))
      clearActive(false)
  }, { deep: true, immediate: true })
  watch([() => store.isLoaded, currentFingerprint, () => store.views], () => {
    if (!store.isLoaded || manualFingerprint.value === currentFingerprint.value)
      return
    const automatic = findAutomaticView(store.views, context.value)
    if (automatic?.id === activeId.value) {
      manualFingerprint.value = null
      return
    }
    if (automatic)
      apply(automatic, false)
    else clearActive(false)
    manualFingerprint.value = null
  }, { deep: true, immediate: true })

  return { activeId, activeView, apply, clearActive, cycle, discard, duplicate, isDirty, saveAs, selectForCurrentContext, store, syncPanelAcrossViews, updateCurrent }
}

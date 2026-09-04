import type { Ref } from 'vue'

import { useStorage } from '@vueuse/core'
import { toRaw } from 'vue'
import { waitForFirstSync } from '~~/services/powersync/db'

import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { SyncableStatConfigPanelId } from '~/components/stat/views/syncPanelConfig'

import { ConfigSchema } from '~/components/stat/config/schema'
import { syncPanelConfig } from '~/components/stat/views/syncPanelConfig'

import type { BlockRule, StatBlockPanelId, StatView, StatViewConfig, StatViewContext } from './types'

import { contextFingerprint, findAutomaticView } from './evaluateConditions'
import { useStatViewsStore } from './useStatViewsStore'

function cloneConfig(value: MiniItemConfig): MiniItemConfig {
  return ConfigSchema.parse(toRaw(value))
}

function cloneViewConfig(value: StatViewConfig): StatViewConfig {
  return JSON.parse(JSON.stringify(value)) as StatViewConfig
}

function cloneBlockRules(value: StatViewConfig['blockRules']): StatViewConfig['blockRules'] {
  return JSON.parse(JSON.stringify(value)) as StatViewConfig['blockRules']
}

function cloneRules(value: BlockRule[]): BlockRule[] {
  return JSON.parse(JSON.stringify(value)) as BlockRule[]
}

export function useStatViewController(config: Ref<MiniItemConfig>, context: Ref<StatViewContext>) {
  const { t } = useI18n()
  const store = useStatViewsStore()
  const activeId = computed(() => store.views.find(view => view.isActive)?.id ?? null)
  const manualFingerprint = useStorage<string | null>('finapp.dashboard.statView.manualFingerprint', null)
  const activeView = computed(() => store.views.find(view => view.id === activeId.value) ?? null)
  const configFingerprint = computed(() => JSON.stringify(config.value))
  const isDirty = computed(() => !!activeView.value && JSON.stringify(config.value) !== JSON.stringify(activeView.value.config.base))
  const currentFingerprint = computed(() => contextFingerprint(context.value))

  function clearActive(manual = true) {
    void store.setActive(null)
    if (manual)
      manualFingerprint.value = currentFingerprint.value
  }

  function apply(view: StatView, manual = true) {
    if (manual)
      void store.setActive(view.id)
    config.value = cloneConfig(view.config.base)
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
    const view = await store.create({ autoRule, config: { base: cloneConfig(config.value), blockRules: {} }, isAutoEnabled, name, scope: 'dashboard' })
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
      config: cloneViewConfig(source.config),
      isAutoEnabled: source.isAutoEnabled,
      name: `${source.name} ${suffix}`,
      scope: source.scope,
    })
    apply(view)
    return view
  }
  async function updateMetadata(patch: Partial<Pick<StatView, 'autoRule' | 'isAutoEnabled' | 'name'>>) {
    if (!activeView.value)
      return null
    return store.update(activeView.value.id, patch)
  }
  async function saveCurrentConfig() {
    if (!activeView.value)
      return null
    return store.update(activeView.value.id, {
      config: {
        base: cloneConfig(config.value),
        blockRules: cloneBlockRules(activeView.value.config.blockRules),
      },
    })
  }
  let configSaveQueue = Promise.resolve()
  watch(configFingerprint, () => {
    configSaveQueue = configSaveQueue
      .catch(() => undefined)
      .then(async () => {
        if (!activeView.value || !isDirty.value)
          return
        await saveCurrentConfig()
      })
  })
  watch(activeView, (view) => {
    if (view && JSON.stringify(config.value) !== JSON.stringify(view.config.base))
      config.value = cloneConfig(view.config.base)
  }, { immediate: true })
  async function syncPanelAcrossViews(panel: SyncableStatConfigPanelId, includeRules = false) {
    if (!activeView.value)
      return []
    const source = cloneConfig(config.value)
    return store.updateMany(store.views.map(view => ({
      id: view.id,
      patch: {
        config: {
          base: syncPanelConfig(panel, source, view.config.base),
          blockRules: includeRules
            ? { ...cloneBlockRules(view.config.blockRules), [panel]: cloneRules(activeView.value!.config.blockRules[panel] ?? []) }
            : cloneBlockRules(view.config.blockRules),
        },
      },
    })))
  }
  function updateBlockRules(panel: StatBlockPanelId, rules: BlockRule[]) {
    const viewId = activeView.value?.id
    const nextRules = cloneRules(rules)
    if (!viewId)
      return Promise.resolve()
    configSaveQueue = configSaveQueue
      .catch(() => undefined)
      .then(async () => {
        const current = store.views.find(view => view.id === viewId)
        if (!current)
          return
        const blockRules = cloneBlockRules(current.config.blockRules)
        if (nextRules.length)
          blockRules[panel] = nextRules
        else
          delete blockRules[panel]
        await store.update(viewId, {
          config: { base: cloneConfig(current.config.base), blockRules },
        })
      })
    return configSaveQueue
  }
  function discard() {
    if (activeView.value)
      apply(activeView.value, false)
  }
  function selectForCurrentContext() {
    const automatic = findAutomaticView(store.views, context.value)
    const fallback = store.views.find(view => view.name === t('stat.views.defaultName'))
      ?? store.views.find(view => view.name === t('stat.views.modern'))
      ?? store.views[0]
    const view = automatic ?? fallback
    if (view)
      apply(view, false)
    return view ?? null
  }
  let isEnsuringActiveView = false
  let hasWaitedForFirstSync = false
  watch([
    () => store.isLoaded,
    () => store.views.length,
    () => store.views.some(view => view.isActive),
  ], async ([viewsLoaded, , hasActiveView]) => {
    if (!viewsLoaded || hasActiveView || isEnsuringActiveView)
      return
    isEnsuringActiveView = true
    try {
      if (!store.isDemo && !hasWaitedForFirstSync) {
        await waitForFirstSync()
        hasWaitedForFirstSync = true
        if (store.views.some(view => view.isActive))
          return
      }
      const fallback = store.views.find(view => view.name === t('stat.views.defaultName'))
        ?? store.views.find(view => view.name === t('stat.views.modern'))
        ?? store.views[0]
      const view = fallback ?? await store.create({
        autoRule: null,
        config: { base: cloneConfig(config.value), blockRules: {} },
        id: store.defaultViewId('dashboard'),
        isAutoEnabled: false,
        name: t('stat.views.defaultName'),
        scope: 'dashboard',
      })
      if (!view.isActive)
        await store.setActive(view.id)
      if (activeId.value === null)
        apply(view, false)
    }
    finally {
      isEnsuringActiveView = false
    }
  }, { immediate: true })
  watch([() => store.isLoaded, currentFingerprint], () => {
    if (!store.isLoaded || manualFingerprint.value === currentFingerprint.value)
      return
    const automatic = findAutomaticView(store.views, context.value)
    if (automatic?.id === activeId.value) {
      manualFingerprint.value = null
      return
    }
    if (automatic) {
      apply(automatic, false)
      manualFingerprint.value = null
      return
    }
    if (activeView.value && (!activeView.value.isAutoEnabled || manualFingerprint.value !== null)) {
      manualFingerprint.value = currentFingerprint.value
      return
    }
    selectForCurrentContext()
    manualFingerprint.value = null
  }, { immediate: true })

  return { activeId, activeView, apply, clearActive, context, cycle, discard, duplicate, isDirty, saveAs, selectForCurrentContext, store, syncPanelAcrossViews, updateBlockRules, updateMetadata }
}

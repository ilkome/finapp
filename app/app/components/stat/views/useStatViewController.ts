import type { Ref } from 'vue'

import { toRaw } from 'vue'
import { waitForFirstSync } from '~~/services/powersync/db'

import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { SyncableStatConfigPanelId } from '~/components/stat/views/syncPanelConfig'

import { ConfigSchema } from '~/components/stat/config/schema'
import { syncPanelConfig } from '~/components/stat/views/syncPanelConfig'

import type { BlockRule, StatBlockPanelId, StatView, StatViewConfig, StatViewContext } from './types'

import { findAutomaticView } from './evaluateConditions'
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
  // A view bound to the open category/wallet page applies locally: `isActive` stays the pick the
  // user made themselves, so leaving the page restores it instead of a guessed fallback. Config
  // and `activeId` must never diverge either, or the autosave below writes into the wrong view.
  const appliedId = ref<string | null>(null)
  const activeId = computed(() => (appliedId.value && store.views.some(view => view.id === appliedId.value)
    ? appliedId.value
    : store.views.find(view => view.isActive)?.id) ?? null)
  const activeView = computed(() => store.views.find(view => view.id === activeId.value) ?? null)
  const configFingerprint = computed(() => JSON.stringify(config.value))
  const isDirty = computed(() => !!activeView.value && JSON.stringify(config.value) !== JSON.stringify(activeView.value.config.base))

  function applyLocal(view: StatView) {
    appliedId.value = view.id
    config.value = cloneConfig(view.config.base)
  }

  // Persisting the active view is async, and until it lands `store.views` shows no active row.
  // The fallback watcher must not treat that gap as "nothing is selected" and create a view.
  let isApplyingManually = false
  function apply(view: StatView) {
    applyLocal(view)
    isApplyingManually = true
    void store.setActive(view.id).finally(() => {
      isApplyingManually = false
    })
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
  // The stat page always needs one view, so dropping the last one resets it instead of deleting.
  async function remove(id: string) {
    if (store.views.length === 1) {
      const fallback = await store.update(id, { isActive: true, name: t('stat.views.defaultName') })
      if (fallback)
        apply(fallback)
      return
    }
    await store.remove(id)
  }
  let isEnsuringActiveView = false
  let hasWaitedForFirstSync = false
  watch([
    () => store.isLoaded,
    () => store.views.length,
    () => store.views.some(view => view.isActive),
  ], async ([viewsLoaded, , hasActiveView]) => {
    // A manual pick writes two rows; the feed can observe the gap where neither is active.
    if (!viewsLoaded || hasActiveView || isEnsuringActiveView || isApplyingManually)
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
    }
    finally {
      isEnsuringActiveView = false
    }
  }, { immediate: true })

  // Only the open page moves the applied view. Leaving a bound page drops the local override and
  // `activeView` falls back to the stored pick, which the watcher above feeds back into the config.
  const automaticViewId = computed(() => store.isLoaded
    ? findAutomaticView(store.views, context.value)?.id ?? null
    : null)
  watch(automaticViewId, (id) => {
    const view = id ? store.views.find(item => item.id === id) : null
    if (view)
      applyLocal(view)
    else
      appliedId.value = null
  }, { immediate: true })

  return { activeId, activeView, apply, context, cycle, duplicate, isDirty, remove, store, syncPanelAcrossViews, updateBlockRules, updateMetadata }
}

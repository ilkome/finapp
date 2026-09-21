import type { Ref } from 'vue'

import { toRaw } from 'vue'

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
  const store = useStatViewsStore()
  // A view bound to the open category/wallet page applies locally: `isActive` stays the pick the
  // user made themselves, so leaving the page restores it instead of a guessed fallback. Config
  // and `activeId` must never diverge either, or the autosave below writes into the wrong view.
  const appliedId = ref<string | null>(null)
  const activeId = computed(() => (appliedId.value && store.views.some(view => view.id === appliedId.value)
    ? appliedId.value
    : store.views.find(view => view.isActive)?.id) ?? null)
  const activeView = computed(() => store.views.find(view => view.id === activeId.value) ?? null)

  function applyLocal(view: StatView) {
    appliedId.value = view.id
    config.value = cloneConfig(view.config.base)
  }

  function apply(view: StatView) {
    applyLocal(view)
    void store.setActive(view.id)
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
  // Editing the built-in view forks it; the fork must become the applied view, or the local
  // page override keeps pointing at the adaptive one and every later edit forks again.
  async function persist(viewId: string, patch: Parameters<typeof store.update>[1]) {
    const next = await store.update(viewId, patch)
    if (next && next.id !== viewId && appliedId.value === viewId)
      appliedId.value = next.id
    return next
  }
  async function updateMetadata(patch: Partial<Pick<StatView, 'autoRule' | 'isAutoEnabled' | 'name'>>) {
    if (!activeView.value)
      return null
    return persist(activeView.value.id, patch)
  }
  let configSaveQueue = Promise.resolve()
  // Only explicit edits reach the stored view. Watching `config` for any divergence used to
  // persist wholesale replacements too (a failed schema parse falling back to defaults, a
  // wallet page re-reading a query-keyed storage slot) and wiped the view's saved config.
  function saveCurrentConfig() {
    const viewId = activeView.value?.id
    if (!viewId)
      return Promise.resolve()
    configSaveQueue = configSaveQueue
      .catch(() => undefined)
      .then(async () => {
        const current = store.views.find(view => view.id === viewId)
        if (!current || JSON.stringify(config.value) === JSON.stringify(current.config.base))
          return
        await persist(viewId, {
          config: {
            base: cloneConfig(config.value),
            blockRules: cloneBlockRules(current.config.blockRules),
          },
        })
      })
    return configSaveQueue
  }
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
        await persist(viewId, {
          config: { base: cloneConfig(current.config.base), blockRules },
        })
      })
    return configSaveQueue
  }
  // The built-in adaptive view always remains, so deleting never leaves the page without one.
  function remove(id: string) {
    return store.remove(id)
  }

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

  return { activeId, activeView, apply, context, cycle, duplicate, remove, saveCurrentConfig, store, syncPanelAcrossViews, updateBlockRules, updateMetadata }
}

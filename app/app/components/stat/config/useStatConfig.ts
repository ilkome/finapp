import type { DeepPartial } from '~~/utils/types'

import { useStorage } from '@vueuse/core'
import defu from 'defu'
import { computed, toValue } from 'vue'

import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { StatConfigParams } from '~/components/stat/config/types'

import { applyConfigProps, applyConfigUpdate, ConfigSchema, defaultConfig } from '~/components/stat/config/schema'

export function parseStoredStatConfig(storageValue: unknown, defaults: MiniItemConfig, legacyTab?: unknown): MiniItemConfig | null {
  const stored = storageValue as {
    categories?: {
      bars?: { grouping?: unknown, isGrouped?: unknown }
      list?: { grouping?: unknown, isGrouped?: unknown }
      round?: { grouping?: unknown, isGrouped?: unknown }
    }
    chart?: { breakdown?: unknown, isByCategories?: unknown, layout?: unknown, line?: unknown, type?: unknown, view?: unknown }
    date?: { quickRangeIds?: unknown, quickRangeOrderIds?: unknown }
    page?: { blockOrder?: unknown, layout?: unknown }
  } | undefined
  const legacyChartLayout = legacyTab === 'split' ? 'split' : 'combined-wide'
  const legacyPageLayout = legacyTab === 'split' ? 'split' : 'combined'
  const storedLayout = stored?.chart?.layout === 'split'
    ? 'split'
    : stored?.chart?.layout === 'combined'
      ? (stored?.chart?.view === 'half' ? 'combined-narrow' : 'combined-wide')
      : stored?.chart?.layout
  const legacyLine = stored?.chart?.type === 'area'
    ? { isGradient: true, isShowPoints: true, isSkipZero: false, isSmooth: false }
    : stored?.chart?.type === 'stackedLine'
      ? { isGradient: false, isShowPoints: false, isSkipZero: false, isSmooth: false }
      : undefined
  const storedChartType = stored?.chart?.type === 'area' || stored?.chart?.type === 'stackedLine'
    ? 'line'
    : stored?.chart?.type
  const migrated = {
    ...stored,
    categories: {
      ...stored?.categories,
      bars: {
        ...stored?.categories?.bars,
        grouping: stored?.categories?.bars?.grouping
          ?? (typeof stored?.categories?.bars?.isGrouped === 'boolean' ? (stored.categories.bars.isGrouped ? 'parent' : 'child') : undefined),
      },
      list: {
        ...stored?.categories?.list,
        grouping: stored?.categories?.list?.grouping
          ?? (typeof stored?.categories?.list?.isGrouped === 'boolean' ? (stored.categories.list.isGrouped ? 'parent' : 'child') : undefined),
      },
      round: {
        ...stored?.categories?.round,
        grouping: stored?.categories?.round?.grouping
          ?? (typeof stored?.categories?.round?.isGrouped === 'boolean' ? (stored.categories.round.isGrouped ? 'parent' : 'child') : undefined),
      },
    },
    chart: {
      ...stored?.chart,
      breakdown: stored?.chart?.breakdown ?? (stored?.chart?.isByCategories ? 'categories' : 'cashflow'),
      layout: storedLayout ?? legacyChartLayout,
      line: stored?.chart?.line ?? legacyLine,
      type: storedChartType,
    },
    page: {
      ...stored?.page,
      layout: stored?.page?.layout ?? legacyPageLayout,
    },
  }
  const merged = defu(migrated, defaults)
  if (Array.isArray(stored?.date?.quickRangeIds))
    merged.date.quickRangeIds = stored.date.quickRangeIds
  if (Array.isArray(stored?.date?.quickRangeOrderIds))
    merged.date.quickRangeOrderIds = stored.date.quickRangeOrderIds
  if (Array.isArray(stored?.page?.blockOrder))
    merged.page.blockOrder = stored.page.blockOrder

  const parsed = ConfigSchema.safeParse(merged)
  return parsed.success ? parsed.data : null
}

export function normalizeStoredStatConfig(storageValue: unknown, defaults: MiniItemConfig, legacyTab?: unknown): MiniItemConfig {
  return parseStoredStatConfig(storageValue, defaults, legacyTab) ?? structuredClone(defaults)
}

export function useStatConfig({
  initialConfig,
  legacyStorageKey,
  legacyTab,
  props,
  stableStorage,
  storage,
  storageKey,
  storageQuery,
}: StatConfigParams) {
  const route = useRouter().currentRoute
  const configStorageQuery = computed(() => toValue(storageQuery) ?? route.value.query)
  const configStorageKey = computed(() => {
    if (stableStorage)
      return `finapp-${toValue(storageKey)}`
    const query = configStorageQuery.value
    const queryKey = Object.entries(query).map(([k, v]) => `${k}=${v}`).join('&')
    return `finapp-${toValue(storageKey)}-${queryKey}`
  })
  const resolvedStorage = storage ?? localStorage
  const oldStorageKey = toValue(legacyStorageKey)
  if (oldStorageKey) {
    const currentKey = configStorageKey.value
    const previousKey = currentKey.replace(`finapp-${toValue(storageKey)}-`, `finapp-${oldStorageKey}-`)
    if (resolvedStorage.getItem(currentKey) === null) {
      const previousValue = resolvedStorage.getItem(previousKey)
      if (previousValue !== null)
        resolvedStorage.setItem(currentKey, previousValue)
    }
  }

  // structuredClone: `defaultConfig` is one shared module-level object, and every
  // stat-hosting page calls this composable with its own storageKey - without
  // cloning, useStorage would seed each page's ref from the same nested objects.
  const initialValue = normalizeStoredStatConfig(initialConfig, defaultConfig, legacyTab)
  const config = useStorage<MiniItemConfig>(configStorageKey, structuredClone(initialValue), resolvedStorage, {
    flush: 'sync',
    listenToStorageChanges: !stableStorage,
    mergeDefaults: (storageValue, defaults) => normalizeStoredStatConfig(storageValue, defaults as MiniItemConfig, legacyTab),
  })

  if (initialConfig !== undefined)
    config.value = normalizeStoredStatConfig(initialConfig, initialValue, legacyTab)

  config.value = normalizeStoredStatConfig(config.value, initialValue, legacyTab)

  if (props)
    config.value = applyConfigProps(config.value, props)

  function updateConfig<K extends keyof MiniItemConfig>(key: K, value: DeepPartial<MiniItemConfig[K]>) {
    const result = applyConfigUpdate(config.value, key, value)
    if (result)
      config.value = result
  }

  return {
    config,
    updateConfig,
  }
}

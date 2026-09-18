import type { DeepPartial } from '~~/utils/types'

import { useStorage } from '@vueuse/core'
import { computed, toValue } from 'vue'

import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { StatConfigParams } from '~/components/stat/config/types'

import { mergeStatConfig } from '~/components/stat/config/mergeConfig'
import { applyConfigProps, applyConfigUpdate, ConfigSchema, defaultConfig } from '~/components/stat/config/schema'

export function parseStoredStatConfig(storageValue: unknown, defaults: MiniItemConfig): MiniItemConfig | null {
  const parsed = ConfigSchema.safeParse(mergeStatConfig((storageValue ?? {}) as Partial<MiniItemConfig>, defaults))
  return parsed.success ? parsed.data : null
}

export function normalizeStoredStatConfig(storageValue: unknown, defaults: MiniItemConfig): MiniItemConfig {
  return parseStoredStatConfig(storageValue, defaults) ?? structuredClone(defaults)
}

export function useStatConfig({
  initialConfig,
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

  // structuredClone: `defaultConfig` is one shared module-level object, and every
  // stat-hosting page calls this composable with its own storageKey - without
  // cloning, useStorage would seed each page's ref from the same nested objects.
  const initialValue = normalizeStoredStatConfig(initialConfig, defaultConfig)
  const config = useStorage<MiniItemConfig>(configStorageKey, structuredClone(initialValue), resolvedStorage, {
    flush: 'sync',
    listenToStorageChanges: !stableStorage,
    mergeDefaults: (storageValue, defaults) => normalizeStoredStatConfig(storageValue, defaults as MiniItemConfig),
  })

  if (initialConfig !== undefined)
    config.value = normalizeStoredStatConfig(initialConfig, initialValue)

  config.value = normalizeStoredStatConfig(config.value, initialValue)

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

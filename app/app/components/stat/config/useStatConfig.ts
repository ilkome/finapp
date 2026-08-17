import type { DeepPartial } from '~~/utils/types'

import { useStorage } from '@vueuse/core'
import defu from 'defu'

import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { StatConfigParams } from '~/components/stat/config/types'

import { applyConfigProps, applyConfigUpdate, defaultConfig } from '~/components/stat/config/schema'

export function normalizeStoredStatConfig(storageValue: unknown, defaults: MiniItemConfig): MiniItemConfig {
  const stored = storageValue as { chart?: { type?: unknown } } | undefined
  const config = defu(stored ?? {}, defaults) as MiniItemConfig
  if (stored?.chart?.type !== 'pie')
    return config

  return {
    ...config,
    chart: {
      ...config.chart,
      type: 'bar',
    },
  }
}

export function useStatConfig({ initialConfig, props, storage, storageKey }: StatConfigParams) {
  const configStorageKey = computed(() => {
    const query = useRouter().currentRoute.value.query
    const queryKey = Object.entries(query).map(([k, v]) => `${k}=${v}`).join('&')
    return `finapp-${storageKey}-${queryKey}`
  })

  // structuredClone: `defaultConfig` is one shared module-level object, and every
  // stat-hosting page calls this composable with its own storageKey - without
  // cloning, useStorage would seed each page's ref from the same nested objects.
  const config = useStorage<MiniItemConfig>(configStorageKey.value, structuredClone(initialConfig ?? defaultConfig), storage ?? localStorage, {
    mergeDefaults: (storageValue, defaults) => normalizeStoredStatConfig(storageValue, defaults as MiniItemConfig),
  })

  if (props)
    config.value = applyConfigProps(config.value, props)

  function updateConfig<K extends keyof MiniItemConfig>(key: K, value: DeepPartial<MiniItemConfig[K]>) {
    const result = applyConfigUpdate(config.value, key, value)
    if (result)
      config.value = result
  }

  // Tabs only fit on a laptop with a mouse; mobile (and a wide touchscreen) shows
  // the combined summary view instead. One rule, read by Menu/Header/Wrap.
  const showTabs = useIsLaptop()

  return {
    config,
    showTabs,
    updateConfig,
  }
}

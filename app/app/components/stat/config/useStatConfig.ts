import type { DeepPartial } from '~~/utils/types'

import { useStorage } from '@vueuse/core'
import defu from 'defu'

import type { MiniItemConfig } from '~/components/stat/config/schema'

import { applyConfigUpdate, defaultConfig } from '~/components/stat/config/schema'

type StatConfigParams = {
  props?: DeepPartial<MiniItemConfig>
  storageKey: string
}

export function useStatConfig({ props, storageKey }: StatConfigParams) {
  const configStorageKey = computed(() => {
    const query = useRouter().currentRoute.value.query
    const queryKey = Object.entries(query).map(([k, v]) => `${k}=${v}`).join('&')
    return `finapp-${storageKey}-${queryKey}`
  })

  // structuredClone: `defaultConfig` is one shared module-level object, and every
  // stat-hosting page calls this composable with its own storageKey - without
  // cloning, useStorage would seed each page's ref from the same nested objects.
  const config = useStorage<MiniItemConfig>(configStorageKey.value, structuredClone(defaultConfig), localStorage, {
    mergeDefaults: (storageValue, defaults) => defu(storageValue, defaults),
  })

  if (props) {
    Object.entries(props).forEach(([key, value]) => {
      if (value !== undefined) {
        updateConfig(key as keyof MiniItemConfig, value as never)
      }
    })
  }

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

export type StatConfigProvider = ReturnType<typeof useStatConfig>

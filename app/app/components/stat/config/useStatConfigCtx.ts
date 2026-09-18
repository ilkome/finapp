import type { ComputedRef } from 'vue'

import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { StatConfigProvider } from '~/components/stat/config/types'

import { statConfigKey } from '~/components/stat/injectionKeys'

type Sections = { [K in keyof MiniItemConfig]: ComputedRef<MiniItemConfig[K]> }

/** The provided stat config plus one computed per section, so consumers read `chart.value.type` instead of `config.value.chart.type`. */
export function useStatConfigCtx(): StatConfigProvider & Sections {
  const provider = inject(statConfigKey)!
  const sections = {} as Sections
  for (const key of Object.keys(provider.config.value) as Array<keyof MiniItemConfig>)
    (sections as Record<string, ComputedRef<unknown>>)[key] = computed(() => provider.config.value[key])
  return { ...provider, ...sections }
}

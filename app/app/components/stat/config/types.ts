import type { Ref } from 'vue'
import type { DeepPartial } from '~~/utils/types'

import type { MiniItemConfig } from '~/components/stat/config/schema'

export type StatConfigParams = {
  initialConfig?: MiniItemConfig
  props?: DeepPartial<MiniItemConfig>
  storage?: Storage
  storageKey: string
}

export type StatConfigProvider = {
  config: Ref<MiniItemConfig>
  showTabs: Readonly<Ref<boolean>>
  updateConfig: <K extends keyof MiniItemConfig>(key: K, value: DeepPartial<MiniItemConfig[K]>) => void
}

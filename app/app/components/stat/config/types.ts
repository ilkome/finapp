import type { MaybeRefOrGetter, Ref } from 'vue'
import type { DeepPartial } from '~~/utils/types'

import type { MiniItemConfig } from '~/components/stat/config/schema'

export type StatConfigParams = {
  initialConfig?: unknown
  legacyStorageKey?: MaybeRefOrGetter<string | undefined>
  legacyTab?: unknown
  props?: DeepPartial<MiniItemConfig>
  storage?: Storage
  storageKey: MaybeRefOrGetter<string>
}

export type StatConfigProvider = {
  config: Ref<MiniItemConfig>
  updateConfig: <K extends keyof MiniItemConfig>(key: K, value: DeepPartial<MiniItemConfig[K]>) => void
}

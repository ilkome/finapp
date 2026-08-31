import type { MaybeRefOrGetter, Ref } from 'vue'
import type { DeepPartial } from '~~/utils/types'

import type { MiniItemConfig } from '~/components/stat/config/schema'

export type StatConfigParams = {
  initialConfig?: unknown
  legacyStorageKey?: MaybeRefOrGetter<string | undefined>
  legacyTab?: unknown
  props?: DeepPartial<MiniItemConfig>
  stableStorage?: boolean
  storage?: Storage
  storageKey: MaybeRefOrGetter<string>
  storageQuery?: MaybeRefOrGetter<Record<string, unknown> | undefined>
}

export type StatConfigProvider = {
  config: Readonly<Ref<MiniItemConfig>>
  updateConfig: <K extends keyof MiniItemConfig>(key: K, value: DeepPartial<MiniItemConfig[K]>) => void
}

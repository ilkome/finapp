import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { StatConfigPanelId } from '~/components/stat/types'

import { PANELS } from '~/components/stat/config/panels/registry'
import { ConfigSchema } from '~/components/stat/config/schema'

export type SyncableStatConfigPanelId = Exclude<StatConfigPanelId, 'root'>

export function syncPanelConfig(
  panel: SyncableStatConfigPanelId,
  source: MiniItemConfig,
  target: MiniItemConfig,
): MiniItemConfig {
  const next = ConfigSchema.parse(target)
  PANELS[panel].syncConfig(source, next)
  return ConfigSchema.parse(next)
}

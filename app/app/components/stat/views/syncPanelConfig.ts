import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { StatConfigPanelId } from '~/components/stat/types'

import { ConfigSchema } from '~/components/stat/config/schema'

export type SyncableStatConfigPanelId = Exclude<StatConfigPanelId, 'root'>

export function syncPanelConfig(
  panel: SyncableStatConfigPanelId,
  source: MiniItemConfig,
  target: MiniItemConfig,
): MiniItemConfig {
  const next = structuredClone(target)

  if (panel === 'statAverage')
    next.average = structuredClone(source.average)
  else if (panel === 'navigation') {
    next.date.isPinned = source.date.isPinned
    next.date.isShowNavigation = source.date.isShowNavigation
  }
  else if (panel === 'summary')
    next.summary = structuredClone(source.summary)
  else if (panel === 'wallets')
    next.wallets = structuredClone(source.wallets)
  else if (panel === 'chart') {
    next.chart = structuredClone(source.chart)
    next.date.isShowQuick = source.date.isShowQuick
    next.date.quickRangeIds = [...source.date.quickRangeIds]
    next.date.quickRangeOrderIds = [...source.date.quickRangeOrderIds]
  }
  else if (panel === 'catsRound')
    next.categories.round = structuredClone(source.categories.round)
  else if (panel === 'catsList')
    next.categories.list = structuredClone(source.categories.list)
  else if (panel === 'vertical')
    next.categories.bars = structuredClone(source.categories.bars)
  else if (panel === 'trns')
    next.trns = structuredClone(source.trns)

  return ConfigSchema.parse(next)
}

import type { StatConfigPanelId } from '~/components/stat/types'
import type { StatBlockPanelId } from '~/components/stat/views/types'

import { statConfigBlockOrder, statContextBlockIds } from '~/components/stat/config/schema'
import { statContextBlockIdsKey } from '~/components/stat/injectionKeys'

/** Blocks the current report can configure: contextual ones only where the page provides them. */
export function useStatConfigAvailablePanels() {
  const contextBlockIds = inject(statContextBlockIdsKey, computed(() => []))

  return computed<Exclude<StatConfigPanelId, 'root'>[]>(() => {
    const contextual = new Set<StatBlockPanelId>(contextBlockIds.value)
    return [
      'statAverage',
      ...statConfigBlockOrder.filter(panel => !statContextBlockIds.includes(panel as typeof statContextBlockIds[number]) || contextual.has(panel)),
    ]
  })
}

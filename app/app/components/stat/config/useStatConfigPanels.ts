import type { StatConfigPanelId } from '~/components/stat/types'
import type { StatBlockPanelId } from '~/components/stat/views/types'

import { statConfigBlockOrder, statContextBlockIds } from '~/components/stat/config/schema'
import { statContextBlockIdsKey, statHiddenPanelsKey } from '~/components/stat/injectionKeys'

/** Blocks the current report can configure: contextual ones only where the page provides them. */
export function useStatConfigAvailablePanels() {
  const contextBlockIds = inject(statContextBlockIdsKey, computed(() => []))
  const hiddenPanels = inject(statHiddenPanelsKey, [])

  return computed<Exclude<StatConfigPanelId, 'root'>[]>(() => {
    const contextual = new Set<StatBlockPanelId>(contextBlockIds.value)
    const hidden = new Set<StatBlockPanelId>(hiddenPanels)
    return [
      'statAverage' as const,
      ...statConfigBlockOrder.filter(panel => !statContextBlockIds.includes(panel as typeof statContextBlockIds[number]) || contextual.has(panel)),
    ].filter(panel => !hidden.has(panel))
  })
}

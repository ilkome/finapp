import type { StatConfigPanelId } from '~/components/stat/types'

import { PANELS } from '~/components/stat/config/panels/registry'

/**
 * The view settings open one section at a time: a stacked sheet on mobile, a sliding
 * screen in the desktop sidebar. `auto` is the view's own auto-rule editor, which is
 * not a config panel but shares the same drill-in.
 */
export type StatConfigNavPanel = Exclude<StatConfigPanelId, 'root'> | 'auto'

export function statConfigNavTitleKey(panel: StatConfigNavPanel) {
  return panel === 'auto' ? 'stat.views.auto' : PANELS[panel].titleKey
}

export function useStatConfigNav() {
  const activePanel = useState<StatConfigNavPanel | null>('stat-config-nav-panel', () => null)
  // Slide direction for the desktop transition: forward into a section, back to the list.
  const direction = useState<1 | -1>('stat-config-nav-direction', () => 1)

  function open(panel: StatConfigNavPanel) {
    direction.value = 1
    activePanel.value = panel
  }

  function back() {
    if (activePanel.value === null)
      return false
    direction.value = -1
    activePanel.value = null
    return true
  }

  return { activePanel, back, direction, open }
}

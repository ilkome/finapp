import type { StatConfigPanelId } from '~/components/stat/types'
import type { ConditionGroup } from '~/components/stat/views/types'

import { PANELS } from '~/components/stat/config/panels/registry'

/**
 * The view settings open one section at a time: a stacked sheet on mobile, a sliding
 * screen in the desktop sidebar. `auto` is the view's own auto-rule editor and `rule:`
 * one condition group; neither is a config panel, but both share the same drill-in.
 */
export type StatConfigRuleNavPanel = `rule:${string}`
export type StatConfigNavPanel = Exclude<StatConfigPanelId, 'root'> | 'auto' | StatConfigRuleNavPanel

export function isStatConfigRuleNav(panel: StatConfigNavPanel): panel is StatConfigRuleNavPanel {
  return panel.startsWith('rule:')
}

export function statConfigRuleNavPanel(condition: ConditionGroup): StatConfigRuleNavPanel {
  return `rule:${JSON.stringify(condition)}`
}

export function statConfigRuleNavCondition(panel: StatConfigRuleNavPanel): ConditionGroup {
  return JSON.parse(panel.slice('rule:'.length)) as ConditionGroup
}

export function statConfigNavTitleKey(panel: Exclude<StatConfigNavPanel, StatConfigRuleNavPanel>) {
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

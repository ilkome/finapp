import type { StatView, StatViewConfig, StatViewScope } from './types'

import config from './adaptiveView.config.json'

/**
 * The built-in view every user gets. It is never stored: the store prepends it, it is active
 * whenever no saved view is, and any edit forks it into a saved "Mine" view instead.
 */
export const ADAPTIVE_VIEW_ID = 'stat-view-adaptive'

export function isAdaptiveViewId(id: string | null | undefined) {
  return id === ADAPTIVE_VIEW_ID
}

export function adaptiveViewConfig(): StatViewConfig {
  return structuredClone(config as StatViewConfig)
}

export function adaptiveView(name: string, scope: StatViewScope, isActive: boolean): StatView {
  return {
    autoRule: null,
    config: adaptiveViewConfig(),
    createdAt: 0,
    id: ADAPTIVE_VIEW_ID,
    isActive,
    isAutoEnabled: false,
    name,
    scope,
    sortOrder: -1,
    updatedAt: 0,
    userId: '',
  }
}

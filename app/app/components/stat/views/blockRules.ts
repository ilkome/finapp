import type { DeepPartial } from '~~/utils/types'

import type { MiniItemConfig } from '~/components/stat/config/schema'

import { applyConfigProps } from '~/components/stat/config/schema'
import { statConfigPanelIds } from '~/components/stat/types'
import { syncPanelConfig } from '~/components/stat/views/syncPanelConfig'

import type { BlockRule, StatBlockPanelId, StatViewContext } from './types'

import { evaluateConditionGroup } from './evaluateConditions'

function cloneConfigValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function diffValue(base: unknown, next: unknown): unknown {
  if (Object.is(base, next))
    return undefined
  if (Array.isArray(base) || Array.isArray(next))
    return JSON.stringify(base) === JSON.stringify(next) ? undefined : cloneConfigValue(next)
  if (base && next && typeof base === 'object' && typeof next === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(next)) {
      const difference = diffValue((base as Record<string, unknown>)[key], value)
      if (difference !== undefined)
        result[key] = difference
    }
    return Object.keys(result).length ? result : undefined
  }
  return cloneConfigValue(next)
}

export function applyBlockRuleConfig(
  panel: StatBlockPanelId,
  base: MiniItemConfig,
  overrides: DeepPartial<MiniItemConfig>,
): MiniItemConfig {
  const configured = applyConfigProps(base, overrides)
  return syncPanelConfig(panel, configured, base)
}

export function createBlockRuleOverrides(
  panel: StatBlockPanelId,
  base: MiniItemConfig,
  edited: MiniItemConfig,
): DeepPartial<MiniItemConfig> {
  const panelConfig = syncPanelConfig(panel, edited, base)
  return (diffValue(base, panelConfig) ?? {}) as DeepPartial<MiniItemConfig>
}

export function findMatchingBlockRule(rules: BlockRule[] | undefined, context: StatViewContext): BlockRule | null {
  return rules?.find(rule => rule.isEnabled && evaluateConditionGroup(rule.condition, context)) ?? null
}

export function resolveConfigUpdatePanel<K extends keyof MiniItemConfig>(
  key: K,
  value: DeepPartial<MiniItemConfig[K]>,
): StatBlockPanelId | null {
  if (key === 'average')
    return 'statAverage'
  if (key === 'chart')
    return 'chart'
  if (key === 'summary')
    return 'summary'
  if (key === 'trns')
    return 'trns'
  if (key === 'wallets')
    return 'wallets'
  if (key === 'date')
    return 'isPinned' in value || 'isShowNavigation' in value ? 'navigation' : 'chart'
  if (key === 'categories') {
    if ('round' in value)
      return 'catsRound'
    if ('list' in value)
      return 'catsList'
    if ('bars' in value)
      return 'vertical'
  }
  return null
}

export function resolveEffectiveStatConfig(
  base: MiniItemConfig,
  blockRules: Partial<Record<StatBlockPanelId, BlockRule[]>>,
  context: StatViewContext,
): MiniItemConfig {
  let result = cloneConfigValue(base)
  for (const panel of statConfigPanelIds) {
    const rule = findMatchingBlockRule(blockRules[panel], context)
    if (rule)
      result = applyBlockRuleConfig(panel, result, rule.overrides)
  }
  return result
}

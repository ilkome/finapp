import type { DeepPartial } from '~~/utils/types'

import type { MiniItemConfig } from '~/components/stat/config/schema'

import { applyConfigProps } from '~/components/stat/config/schema'
import { statConfigPanelIds } from '~/components/stat/types'
import { syncPanelConfig } from '~/components/stat/views/syncPanelConfig'

import type { BlockRule, StatBlockPanelId, StatViewContext } from './types'

import { BLOCK_RULE_PARAMETERS, BLOCK_RULE_VISIBILITY_PARAMETER_ID, normalizeBlockRuleParameterIds } from './blockParameters'
import { evaluateConditionGroup } from './evaluateConditions'

function cloneConfigValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function cloneBlockRule(rule: BlockRule): BlockRule {
  return cloneConfigValue(rule)
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

function getPathValue(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => (
    value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined
  ), source)
}

function setPathValue(target: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split('.')
  let current = target
  for (const key of keys.slice(0, -1)) {
    const next = current[key]
    if (!next || typeof next !== 'object' || Array.isArray(next))
      current[key] = {}
    current = current[key] as Record<string, unknown>
  }
  current[keys.at(-1)!] = cloneConfigValue(value)
}

function collectLeafPaths(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return prefix ? [prefix] : []
  return Object.entries(value).flatMap(([key, child]) => collectLeafPaths(child, prefix ? `${prefix}.${key}` : key))
}

function pickBlockRuleOverrides(
  panel: StatBlockPanelId,
  config: MiniItemConfig,
  parameterIds: readonly string[],
): DeepPartial<MiniItemConfig> {
  const result: Record<string, unknown> = {}
  for (const id of normalizeBlockRuleParameterIds(panel, parameterIds)) {
    const parameter = BLOCK_RULE_PARAMETERS[panel].find(item => item.id === id)
    for (const path of parameter?.paths ?? [])
      setPathValue(result, path, getPathValue(config, path))
  }
  return result as DeepPartial<MiniItemConfig>
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
  parameterIds?: readonly string[],
): DeepPartial<MiniItemConfig> {
  const panelConfig = syncPanelConfig(panel, edited, base)
  if (parameterIds)
    return pickBlockRuleOverrides(panel, panelConfig, parameterIds)
  return (diffValue(base, panelConfig) ?? {}) as DeepPartial<MiniItemConfig>
}

export function resolveBlockRuleParameterIds(panel: StatBlockPanelId, rule: BlockRule): string[] {
  if (rule.parameterIds) {
    const ids = rule.isHidden
      ? [BLOCK_RULE_VISIBILITY_PARAMETER_ID, ...rule.parameterIds]
      : rule.parameterIds
    return normalizeBlockRuleParameterIds(panel, ids)
  }

  const overridePaths = new Set(collectLeafPaths(rule.overrides))
  const inferred = BLOCK_RULE_PARAMETERS[panel]
    .filter(parameter => parameter.paths.some(path => overridePaths.has(path)))
    .map(parameter => parameter.id)
  if (rule.isHidden)
    inferred.unshift(BLOCK_RULE_VISIBILITY_PARAMETER_ID)
  return normalizeBlockRuleParameterIds(panel, inferred)
}

export function resolveConfigUpdateParameterIds<K extends keyof MiniItemConfig>(
  panel: StatBlockPanelId,
  key: K,
  value: DeepPartial<MiniItemConfig[K]>,
): string[] {
  const changedPaths = collectLeafPaths(value, key)
  return BLOCK_RULE_PARAMETERS[panel]
    .filter(parameter => parameter.paths.some(path => changedPaths.some(changed => path === changed || path.startsWith(`${changed}.`) || changed.startsWith(`${path}.`))))
    .map(parameter => parameter.id)
}

export function findMatchingBlockRules(rules: BlockRule[] | undefined, context: StatViewContext): BlockRule[] {
  return rules?.filter(rule => rule.isEnabled && evaluateConditionGroup(rule.condition, context)) ?? []
}

export function findMatchingBlockRule(rules: BlockRule[] | undefined, context: StatViewContext): BlockRule | null {
  return findMatchingBlockRules(rules, context)[0] ?? null
}

export function resolveHiddenStatPanels(
  blockRules: Partial<Record<StatBlockPanelId, BlockRule[]>>,
  context: StatViewContext,
): StatBlockPanelId[] {
  return statConfigPanelIds.filter((panel) => {
    const visibilityRule = findMatchingBlockRules(blockRules[panel], context)
      .find(rule => resolveBlockRuleParameterIds(panel, rule).includes(BLOCK_RULE_VISIBILITY_PARAMETER_ID))
    return visibilityRule?.isHidden ?? false
  })
}

function setStatPanelVisibility(panel: StatBlockPanelId, config: MiniItemConfig, isVisible: boolean): MiniItemConfig {
  switch (panel) {
    case 'catsList':
      config.categories.list.isShow = isVisible
      break
    case 'catsRound':
      config.categories.round.isShow = isVisible
      break
    case 'chart':
      config.chart.isShow = isVisible
      break
    case 'categoryChildren':
      config.contextBlocks.categoryChildren.isShow = isVisible
      break
    case 'navigation':
      config.date.isShow = isVisible
      break
    case 'statAverage':
      config.average.isShow = isVisible
      break
    case 'summary':
      config.summary.isShow = isVisible
      break
    case 'trns':
      config.trns.isShow = isVisible
      break
    case 'vertical':
      config.categories.bars.isShow = isVisible
      break
    case 'walletBalance':
      config.contextBlocks.walletBalance.isShow = isVisible
      break
    case 'walletDescription':
      config.contextBlocks.walletDescription.isShow = isVisible
      break
    case 'wallets':
      config.wallets.isShow = isVisible
      break
  }
  return config
}

export function resolveConfigUpdatePanel<K extends keyof MiniItemConfig>(
  key: K,
  value: DeepPartial<MiniItemConfig[K]>,
): StatBlockPanelId | null {
  if (key === 'average')
    return 'statAverage'
  if (key === 'chart')
    return 'chart'
  if (key === 'contextBlocks') {
    if ('categoryChildren' in value)
      return 'categoryChildren'
    if ('walletBalance' in value)
      return 'walletBalance'
    if ('walletDescription' in value)
      return 'walletDescription'
  }
  if (key === 'summary')
    return 'summary'
  if (key === 'trns')
    return 'trns'
  if (key === 'wallets')
    return 'wallets'
  if (key === 'date')
    return 'isPinned' in value || 'isShow' in value || 'isShowNavigation' in value ? 'navigation' : 'chart'
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
    const rules = findMatchingBlockRules(blockRules[panel], context)
    for (const rule of rules.toReversed()) {
      result = applyBlockRuleConfig(panel, result, rule.overrides)
      if (resolveBlockRuleParameterIds(panel, rule).includes(BLOCK_RULE_VISIBILITY_PARAMETER_ID))
        result = setStatPanelVisibility(panel, result, !rule.isHidden)
    }
  }
  return result
}

import type { MiniItemConfig } from '~/components/stat/config/schema'

import type { StatBlockPanelId } from './types'

export const BLOCK_RULE_VISIBILITY_PARAMETER_ID = 'visibility'

export type BlockRuleParameterDefinition = {
  id: string
  paths: string[]
  titleKey: string
}

const visibility: BlockRuleParameterDefinition = {
  id: BLOCK_RULE_VISIBILITY_PARAMETER_ID,
  paths: [],
  titleKey: 'stat.views.blockRules.parameters.visibility',
}

export const BLOCK_RULE_PARAMETERS: Record<StatBlockPanelId, BlockRuleParameterDefinition[]> = {
  catsList: [
    visibility,
    { id: 'categories.list.grouping', paths: ['categories.list.grouping'], titleKey: 'stat.config.categories.grouping.title' },
    { id: 'categories.list.trendType', paths: ['categories.list.trendType'], titleKey: 'stat.config.categories.list.trendType' },
    { id: 'categories.list.backgroundType', paths: ['categories.list.backgroundType'], titleKey: 'stat.config.categories.list.backgroundType' },
    { id: 'categories.list.isShowTitle', paths: ['categories.list.isShowTitle'], titleKey: 'stat.config.trns.showTitle' },
    { id: 'categories.list.isLines', paths: ['categories.list.isLines'], titleKey: 'stat.catButtons.isLines' },
    { id: 'categories.list.isRoundIcon', paths: ['categories.list.isRoundIcon'], titleKey: 'stat.catButtons.isRoundIcon' },
  ],
  catsRound: [
    visibility,
    { id: 'categories.round.grouping', paths: ['categories.round.grouping'], titleKey: 'stat.config.categories.grouping.title' },
    { id: 'categories.round.isHideOthersOnSelect', paths: ['categories.round.isHideOthersOnSelect'], titleKey: 'stat.config.categories.rounds.hideOthersOnSelect' },
    { id: 'categories.round.isShowFavorites', paths: ['categories.round.isShowFavorites'], titleKey: 'stat.config.categories.rounds.showFavorites' },
    { id: 'categories.round.isShowRecent', paths: ['categories.round.isShowRecent'], titleKey: 'stat.config.categories.rounds.showRecent' },
    { id: 'categories.round.isIconBg', paths: ['categories.round.isIconBg'], titleKey: 'stat.catButtons.isRoundIcon' },
    { id: 'categories.round.isInlineAmount', paths: ['categories.round.isInlineAmount'], titleKey: 'stat.config.categories.rounds.inlineAmount' },
  ],
  chart: [
    visibility,
    { id: 'chart.type', paths: ['chart.type'], titleKey: 'stat.view.chartType.title' },
    { id: 'chart.breakdown', paths: ['chart.breakdown'], titleKey: 'stat.view.breakdown.title' },
    { id: 'chart.pie.shape', paths: ['chart.pie.shape'], titleKey: 'stat.view.pieShape.title' },
    { id: 'chart.pie.isShowLabels', paths: ['chart.pie.isShowLabels'], titleKey: 'stat.config.chart.pie.showLabels' },
    { id: 'chart.pie.isShowPercent', paths: ['chart.pie.isShowPercent'], titleKey: 'stat.config.chart.pie.showPercent' },
    { id: 'chart.isGrouped', paths: ['chart.isGrouped'], titleKey: 'stat.view.barLayout.title' },
    { id: 'chart.line.isShowPoints', paths: ['chart.line.isShowPoints'], titleKey: 'stat.config.chart.line.showPoints' },
    { id: 'chart.line.isSmooth', paths: ['chart.line.isSmooth'], titleKey: 'stat.config.chart.line.smooth' },
    { id: 'chart.line.isGradient', paths: ['chart.line.isGradient'], titleKey: 'stat.config.chart.line.gradient' },
    { id: 'chart.line.isSkipZero', paths: ['chart.line.isSkipZero'], titleKey: 'stat.config.chart.line.skipZero' },
    { id: 'chart.valueDisplay', paths: ['chart.valueDisplay'], titleKey: 'stat.view.valueDisplay.title' },
    { id: 'chart.isShowScale', paths: ['chart.isShowScale'], titleKey: 'stat.config.chart.scale.label' },
    { id: 'chart.isShowAverage', paths: ['chart.isShowAverage'], titleKey: 'stat.config.chart.average.label' },
    { id: 'chart.layout', paths: ['chart.layout'], titleKey: 'stat.view.chartLayout.title' },
    { id: 'chart.isShowBackground', paths: ['chart.isShowBackground'], titleKey: 'stat.config.chart.background.label' },
    { id: 'date.isShowQuick', paths: ['date.isShowQuick'], titleKey: 'stat.config.date.quick.label' },
    { id: 'date.quickRanges', paths: ['date.quickRangeIds', 'date.quickRangeOrderIds'], titleKey: 'stat.config.date.quick.period' },
  ],
  navigation: [
    visibility,
    { id: 'date.isPinned', paths: ['date.isPinned'], titleKey: 'stat.config.navigation.pin' },
    { id: 'date.isShowNavigation', paths: ['date.isShowNavigation'], titleKey: 'stat.config.navigation.showButtons' },
  ],
  statAverage: [
    visibility,
    { id: 'average.count', paths: ['average.count'], titleKey: 'stat.config.statAverage.count.label' },
  ],
  summary: [
    visibility,
    { id: 'summary.isPinned', paths: ['summary.isPinned'], titleKey: 'stat.config.summary.pin' },
    { id: 'summary.isShowChart', paths: ['summary.isShowChart'], titleKey: 'stat.config.summary.showChart' },
  ],
  trns: [
    visibility,
    { id: 'trns.isShowTitle', paths: ['trns.isShowTitle'], titleKey: 'stat.config.trns.showTitle' },
    { id: 'trns.isShowTypeTabs', paths: ['trns.isShowTypeTabs'], titleKey: 'stat.config.trns.showTypeTabs' },
    { id: 'trns.isShowHistory', paths: ['trns.isShowHistory'], titleKey: 'stat.config.trns.showHistory' },
  ],
  vertical: [
    visibility,
    { id: 'categories.bars.grouping', paths: ['categories.bars.grouping'], titleKey: 'stat.config.categories.grouping.title' },
    { id: 'categories.bars.isShowTooltip', paths: ['categories.bars.isShowTooltip'], titleKey: 'stat.config.categories.vertical.showTooltip' },
    { id: 'categories.bars.isShowTooltipChildren', paths: ['categories.bars.isShowTooltipChildren'], titleKey: 'stat.config.categories.vertical.showTooltipChildren' },
  ],
  wallets: [
    visibility,
    { id: 'wallets.displayMode', paths: ['wallets.displayMode'], titleKey: 'stat.config.wallets.displayMode' },
    { id: 'wallets.count', paths: ['wallets.count'], titleKey: 'stat.config.wallets.count' },
    { id: 'wallets.selectionMode', paths: ['wallets.selectionMode'], titleKey: 'stat.config.wallets.selectionMode' },
    { id: 'wallets.isShowIcon', paths: ['wallets.isShowIcon'], titleKey: 'stat.config.wallets.showIcon' },
  ],
}

export function getBlockRuleParameter(panel: StatBlockPanelId, id: string): BlockRuleParameterDefinition | undefined {
  return BLOCK_RULE_PARAMETERS[panel].find(parameter => parameter.id === id)
}

export function normalizeBlockRuleParameterIds(panel: StatBlockPanelId, ids: readonly string[]): string[] {
  const allowed = new Set(BLOCK_RULE_PARAMETERS[panel].map(parameter => parameter.id))
  return [...new Set(ids)].filter(id => allowed.has(id))
}

export function isBlockRuleParameterAvailable(
  panel: StatBlockPanelId,
  id: string,
  config: MiniItemConfig,
  canSplit: boolean,
): boolean {
  if (panel === 'catsList' && id === 'categories.list.isLines')
    return config.categories.list.backgroundType === 'none'
  if (panel === 'wallets' && id === 'wallets.count')
    return config.wallets.displayMode === 'recent'
  if (panel === 'trns' && id === 'trns.isShowHistory')
    return config.page.blockOrder.at(-1) === 'trns'
  if (panel === 'vertical' && id === 'categories.bars.isShowTooltipChildren')
    return config.categories.bars.isShowTooltip
  if (panel !== 'chart')
    return true
  if (id.startsWith('chart.pie.'))
    return config.chart.type === 'pie'
  if (id === 'chart.isGrouped')
    return config.chart.type === 'bar'
  if (id.startsWith('chart.line.'))
    return config.chart.type === 'line'
  if (['chart.isShowAverage', 'chart.isShowScale', 'chart.valueDisplay'].includes(id))
    return config.chart.type !== 'pie'
  if (id === 'chart.layout')
    return canSplit
  if (id === 'date.quickRanges')
    return config.date.isShowQuick
  return true
}

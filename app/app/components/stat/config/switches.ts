import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { StatConfigProvider } from '~/components/stat/config/types'

export type StatConfigBooleanPath
  = | 'categories.bars.isShowTooltip'
    | 'categories.bars.isShowTooltipChildren'
    | 'categories.list.isAutoExpandParents'
    | 'categories.list.isLines'
    | 'categories.list.isRoundIcon'
    | 'categories.list.isShowTitle'
    | 'categories.round.isHideOthersOnSelect'
    | 'categories.round.isIconBg'
    | 'categories.round.isInlineAmount'
    | 'categories.round.isShowFavorites'
    | 'categories.round.isShowRecent'
    | 'chart.isGrouped'
    | 'chart.isShowBackground'
    | 'chart.isShowAverage'
    | 'chart.isShowScale'
    | 'chart.line.isGradient'
    | 'chart.line.isShowPoints'
    | 'chart.line.isSkipZero'
    | 'chart.line.isSmooth'
    | 'chart.pie.isShowLabels'
    | 'chart.pie.isShowPercent'
    | 'date.isPinned'
    | 'date.isShowNavigation'
    | 'date.isShowQuick'
    | 'summary.isPinned'
    | 'summary.isShowChart'
    | 'trns.isShowHistory'
    | 'trns.isShowTitle'
    | 'trns.isShowTypeTabs'
    | 'wallets.isShowIcon'

type BooleanConfigOperation = {
  get: (config: MiniItemConfig) => boolean
  set: (provider: StatConfigProvider, value: boolean) => void
}

export const STAT_CONFIG_BOOLEAN_OPERATIONS: Record<StatConfigBooleanPath, BooleanConfigOperation> = {
  'categories.bars.isShowTooltip': {
    get: config => config.categories.bars.isShowTooltip,
    set: (provider, value) => provider.updateConfig('categories', { bars: { isShowTooltip: value } }),
  },
  'categories.bars.isShowTooltipChildren': {
    get: config => config.categories.bars.isShowTooltipChildren,
    set: (provider, value) => provider.updateConfig('categories', { bars: { isShowTooltipChildren: value } }),
  },
  'categories.list.isAutoExpandParents': {
    get: config => config.categories.list.isAutoExpandParents,
    set: (provider, value) => provider.updateConfig('categories', { list: { isAutoExpandParents: value } }),
  },
  'categories.list.isLines': {
    get: config => config.categories.list.isLines,
    set: (provider, value) => provider.updateConfig('categories', { list: { isLines: value } }),
  },
  'categories.list.isRoundIcon': {
    get: config => config.categories.list.isRoundIcon,
    set: (provider, value) => provider.updateConfig('categories', { list: { isRoundIcon: value } }),
  },
  'categories.list.isShowTitle': {
    get: config => config.categories.list.isShowTitle,
    set: (provider, value) => provider.updateConfig('categories', { list: { isShowTitle: value } }),
  },
  'categories.round.isHideOthersOnSelect': {
    get: config => config.categories.round.isHideOthersOnSelect,
    set: (provider, value) => provider.updateConfig('categories', { round: { isHideOthersOnSelect: value } }),
  },
  'categories.round.isIconBg': {
    get: config => config.categories.round.isIconBg,
    set: (provider, value) => provider.updateConfig('categories', { round: { isIconBg: value } }),
  },
  'categories.round.isInlineAmount': {
    get: config => config.categories.round.isInlineAmount,
    set: (provider, value) => provider.updateConfig('categories', { round: { isInlineAmount: value } }),
  },
  'categories.round.isShowFavorites': {
    get: config => config.categories.round.isShowFavorites,
    set: (provider, value) => provider.updateConfig('categories', { round: { isShowFavorites: value } }),
  },
  'categories.round.isShowRecent': {
    get: config => config.categories.round.isShowRecent,
    set: (provider, value) => provider.updateConfig('categories', { round: { isShowRecent: value } }),
  },
  'chart.isGrouped': {
    get: config => config.chart.isGrouped,
    set: (provider, value) => provider.updateConfig('chart', { isGrouped: value }),
  },
  'chart.isShowAverage': {
    get: config => config.chart.isShowAverage,
    set: (provider, value) => provider.updateConfig('chart', { isShowAverage: value }),
  },
  'chart.isShowBackground': {
    get: config => config.chart.isShowBackground,
    set: (provider, value) => provider.updateConfig('chart', { isShowBackground: value }),
  },
  'chart.isShowScale': {
    get: config => config.chart.isShowScale,
    set: (provider, value) => provider.updateConfig('chart', { isShowScale: value }),
  },
  'chart.line.isGradient': {
    get: config => config.chart.line.isGradient,
    set: (provider, value) => provider.updateConfig('chart', { line: { isGradient: value } }),
  },
  'chart.line.isShowPoints': {
    get: config => config.chart.line.isShowPoints,
    set: (provider, value) => provider.updateConfig('chart', { line: { isShowPoints: value } }),
  },
  'chart.line.isSkipZero': {
    get: config => config.chart.line.isSkipZero,
    set: (provider, value) => provider.updateConfig('chart', { line: { isSkipZero: value } }),
  },
  'chart.line.isSmooth': {
    get: config => config.chart.line.isSmooth,
    set: (provider, value) => provider.updateConfig('chart', { line: { isSmooth: value } }),
  },
  'chart.pie.isShowLabels': {
    get: config => config.chart.pie.isShowLabels,
    set: (provider, value) => provider.updateConfig('chart', { pie: { isShowLabels: value } }),
  },
  'chart.pie.isShowPercent': {
    get: config => config.chart.pie.isShowPercent,
    set: (provider, value) => provider.updateConfig('chart', { pie: { isShowPercent: value } }),
  },
  'date.isPinned': {
    get: config => config.date.isPinned,
    set: (provider, value) => provider.updateConfig('date', { isPinned: value }),
  },
  'date.isShowNavigation': {
    get: config => config.date.isShowNavigation,
    set: (provider, value) => provider.updateConfig('date', { isShowNavigation: value }),
  },
  'date.isShowQuick': {
    get: config => config.date.isShowQuick,
    set: (provider, value) => provider.updateConfig('date', { isShowQuick: value }),
  },
  'summary.isPinned': {
    get: config => config.summary.isPinned,
    set: (provider, value) => provider.updateConfig('summary', { isPinned: value }),
  },
  'summary.isShowChart': {
    get: config => config.summary.isShowChart,
    set: (provider, value) => provider.updateConfig('summary', { isShowChart: value }),
  },
  'trns.isShowHistory': {
    get: config => config.trns.isShowHistory,
    set: (provider, value) => provider.updateConfig('trns', { isShowHistory: value }),
  },
  'trns.isShowTitle': {
    get: config => config.trns.isShowTitle,
    set: (provider, value) => provider.updateConfig('trns', { isShowTitle: value }),
  },
  'trns.isShowTypeTabs': {
    get: config => config.trns.isShowTypeTabs,
    set: (provider, value) => provider.updateConfig('trns', { isShowTypeTabs: value }),
  },
  'wallets.isShowIcon': {
    get: config => config.wallets.isShowIcon,
    set: (provider, value) => provider.updateConfig('wallets', { isShowIcon: value }),
  },
}

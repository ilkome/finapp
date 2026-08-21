import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { StatConfigProvider } from '~/components/stat/config/types'

export type StatConfigBooleanPath
  = | 'categories.bars.isGrouped'
    | 'categories.list.isLines'
    | 'categories.list.isRoundIcon'
    | 'categories.round.isGrouped'
    | 'categories.round.isIconBg'
    | 'categories.round.isInlineAmount'
    | 'categories.round.isShowFavorites'
    | 'categories.round.isShowRecent'
    | 'chart.isGrouped'
    | 'chart.isShowAverage'
    | 'chart.isShowScale'
    | 'chart.line.isGradient'
    | 'chart.line.isShowPoints'
    | 'chart.line.isSkipZero'
    | 'chart.line.isSmooth'
    | 'date.isShowQuick'
    | 'wallets.isShowIcon'

type BooleanConfigOperation = {
  get: (config: MiniItemConfig) => boolean
  set: (provider: StatConfigProvider, value: boolean) => void
}

export const STAT_CONFIG_BOOLEAN_OPERATIONS: Record<StatConfigBooleanPath, BooleanConfigOperation> = {
  'categories.bars.isGrouped': {
    get: config => config.categories.bars.isGrouped,
    set: (provider, value) => provider.updateConfig('categories', { bars: { isGrouped: value } }),
  },
  'categories.list.isLines': {
    get: config => config.categories.list.isLines,
    set: (provider, value) => provider.updateConfig('categories', { list: { isLines: value } }),
  },
  'categories.list.isRoundIcon': {
    get: config => config.categories.list.isRoundIcon,
    set: (provider, value) => provider.updateConfig('categories', { list: { isRoundIcon: value } }),
  },
  'categories.round.isGrouped': {
    get: config => config.categories.round.isGrouped,
    set: (provider, value) => provider.updateConfig('categories', { round: { isGrouped: value } }),
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
  'date.isShowQuick': {
    get: config => config.date.isShowQuick,
    set: (provider, value) => provider.updateConfig('date', { isShowQuick: value }),
  },
  'wallets.isShowIcon': {
    get: config => config.wallets.isShowIcon,
    set: (provider, value) => provider.updateConfig('wallets', { isShowIcon: value }),
  },
}

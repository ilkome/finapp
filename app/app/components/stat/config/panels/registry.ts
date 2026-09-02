import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { StatConfigProvider } from '~/components/stat/config/types'
import type { StatConfigPanelId } from '~/components/stat/types'

function clonePanelConfig<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export type PanelDef = {
  getIsShow: (config: MiniItemConfig) => boolean
  icon: string
  setIsShow: (provider: StatConfigProvider, value: boolean) => void
  syncConfig: (source: MiniItemConfig, target: MiniItemConfig) => void
  titleKey: string
}

export const PANELS: Record<Exclude<StatConfigPanelId, 'root'>, PanelDef> = {
  catsList: {
    getIsShow: config => config.categories.list.isShow,
    icon: 'lucide:list',
    setIsShow: (provider, value) => provider.updateConfig('categories', { list: { isShow: value } }),
    syncConfig: (source, target) => { target.categories.list = clonePanelConfig(source.categories.list) },
    titleKey: 'stat.config.categories.list.title',
  },
  catsRound: {
    getIsShow: config => config.categories.round.isShow,
    icon: 'lucide:cloud',
    setIsShow: (provider, value) => provider.updateConfig('categories', { round: { isShow: value } }),
    syncConfig: (source, target) => { target.categories.round = clonePanelConfig(source.categories.round) },
    titleKey: 'stat.config.categories.rounds.title',
  },
  chart: {
    getIsShow: config => config.chart.isShow,
    icon: 'lucide:chart-no-axes-combined',
    setIsShow: (provider, value) => provider.updateConfig('chart', { isShow: value }),
    syncConfig: (source, target) => {
      target.chart = clonePanelConfig(source.chart)
      target.date.isShowQuick = source.date.isShowQuick
      target.date.quickRangeIds = [...source.date.quickRangeIds]
      target.date.quickRangeOrderIds = [...source.date.quickRangeOrderIds]
    },
    titleKey: 'stat.config.chartShow.title',
  },
  navigation: {
    getIsShow: config => config.date.isShow,
    icon: 'lucide:calendar-range',
    setIsShow: (provider, value) => provider.updateConfig('date', { isShow: value }),
    syncConfig: (source, target) => {
      target.date.isPinned = source.date.isPinned
      target.date.isShow = source.date.isShow
      target.date.isShowNavigation = source.date.isShowNavigation
    },
    titleKey: 'stat.config.navigation.title',
  },
  statAverage: {
    getIsShow: config => config.average.isShow,
    icon: 'lucide:sigma',
    setIsShow: (provider, value) => provider.updateConfig('average', { isShow: value }),
    syncConfig: (source, target) => { target.average = clonePanelConfig(source.average) },
    titleKey: 'stat.config.statAverage.title',
  },
  summary: {
    getIsShow: config => config.summary.isShow,
    icon: 'lucide:badge-dollar-sign',
    setIsShow: (provider, value) => provider.updateConfig('summary', { isShow: value }),
    syncConfig: (source, target) => { target.summary = clonePanelConfig(source.summary) },
    titleKey: 'stat.config.summary.title',
  },
  trns: {
    getIsShow: config => config.trns.isShow,
    icon: 'lucide:receipt-text',
    setIsShow: (provider, value) => provider.updateConfig('trns', { isShow: value }),
    syncConfig: (source, target) => { target.trns = clonePanelConfig(source.trns) },
    titleKey: 'trns.title',
  },
  vertical: {
    getIsShow: config => config.categories.bars.isShow,
    icon: 'lucide:chart-bar-stacked',
    setIsShow: (provider, value) => provider.updateConfig('categories', { bars: { isShow: value } }),
    syncConfig: (source, target) => { target.categories.bars = clonePanelConfig(source.categories.bars) },
    titleKey: 'stat.config.categories.vertical.title',
  },
  wallets: {
    getIsShow: config => config.wallets.isShow,
    icon: 'hugeicons:wallet-01',
    setIsShow: (provider, value) => provider.updateConfig('wallets', { isShow: value }),
    syncConfig: (source, target) => { target.wallets = clonePanelConfig(source.wallets) },
    titleKey: 'stat.config.wallets.title',
  },
}

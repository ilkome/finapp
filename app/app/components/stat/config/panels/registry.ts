import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { StatConfigProvider } from '~/components/stat/config/types'
import type { StatConfigPanelId } from '~/components/stat/types'

export type PanelDef = {
  getIsShow?: (config: MiniItemConfig) => boolean
  icon: string
  setIsShow?: (provider: StatConfigProvider, value: boolean) => void
  titleKey: string
}

export const PANELS: Record<Exclude<StatConfigPanelId, 'root'>, PanelDef> = {
  catsList: {
    getIsShow: config => config.categories.list.isShow,
    icon: 'lucide:list',
    setIsShow: (provider, value) => provider.updateConfig('categories', { list: { isShow: value } }),
    titleKey: 'stat.config.categories.list.title',
  },
  catsRound: {
    getIsShow: config => config.categories.round.isShow,
    icon: 'lucide:cloud',
    setIsShow: (provider, value) => provider.updateConfig('categories', { round: { isShow: value } }),
    titleKey: 'stat.config.categories.rounds.title',
  },
  chart: {
    getIsShow: config => config.chart.isShow,
    icon: 'lucide:chart-no-axes-combined',
    setIsShow: (provider, value) => provider.updateConfig('chart', { isShow: value }),
    titleKey: 'stat.config.chartShow.title',
  },
  navigation: {
    icon: 'lucide:calendar-range',
    titleKey: 'stat.config.navigation.title',
  },
  statAverage: {
    getIsShow: config => config.average.isShow,
    icon: 'lucide:sigma',
    setIsShow: (provider, value) => provider.updateConfig('average', { isShow: value }),
    titleKey: 'stat.config.statAverage.title',
  },
  summary: {
    icon: 'lucide:badge-dollar-sign',
    titleKey: 'stat.config.summary.title',
  },
  trns: {
    getIsShow: config => config.trns.isShow,
    icon: 'lucide:receipt-text',
    setIsShow: (provider, value) => provider.updateConfig('trns', { isShow: value }),
    titleKey: 'trns.title',
  },
  vertical: {
    getIsShow: config => config.categories.bars.isShow,
    icon: 'lucide:chart-bar-stacked',
    setIsShow: (provider, value) => provider.updateConfig('categories', { bars: { isShow: value } }),
    titleKey: 'stat.config.categories.vertical.title',
  },
  wallets: {
    getIsShow: config => config.wallets.isShow,
    icon: 'hugeicons:wallet-01',
    setIsShow: (provider, value) => provider.updateConfig('wallets', { isShow: value }),
    titleKey: 'stat.config.wallets.title',
  },
}

import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { StatConfigProvider } from '~/components/stat/config/useStatConfig'
import type { StatConfigPanelId } from '~/components/stat/types'

export type PanelDef = {
  descKey?: string
  getCount?: (config: MiniItemConfig) => number
  getIsShow: (config: MiniItemConfig) => boolean
  setIsShow: (provider: StatConfigProvider, value: boolean) => void
  subtitleKey?: string
  titleKey: string
}

export const PANELS: Record<Exclude<StatConfigPanelId, 'root'>, PanelDef> = {
  catsList: {
    descKey: 'stat.config.categories.list.description',
    getIsShow: config => config.categories.list.isShow,
    setIsShow: (provider, value) => provider.updateConfig('categories', { list: { isShow: value } }),
    titleKey: 'stat.config.categories.list.title',
  },
  catsRound: {
    descKey: 'stat.config.categories.rounds.description',
    getIsShow: config => config.categories.round.isShow,
    setIsShow: (provider, value) => provider.updateConfig('categories', { round: { isShow: value } }),
    titleKey: 'stat.config.categories.rounds.title',
  },
  chart: {
    getIsShow: config => config.chart.isShow,
    setIsShow: (provider, value) => provider.updateConfig('chart', { isShow: value }),
    titleKey: 'stat.config.chartShow.title',
  },
  statAverage: {
    descKey: 'stat.config.statAverage.description',
    getCount: config => config.average.count,
    getIsShow: config => config.average.isShow,
    setIsShow: (provider, value) => provider.updateConfig('average', { isShow: value }),
    subtitleKey: 'stat.config.statAverage.subtitle',
    titleKey: 'stat.config.statAverage.title',
  },
  vertical: {
    getIsShow: config => config.categories.bars.isShow,
    setIsShow: (provider, value) => provider.updateConfig('categories', { bars: { isShow: value } }),
    titleKey: 'stat.config.categories.vertical.title',
  },
  wallets: {
    descKey: 'stat.config.wallets.description',
    getCount: config => config.wallets.count,
    getIsShow: config => config.wallets.isShow,
    setIsShow: (provider, value) => provider.updateConfig('wallets', { isShow: value }),
    subtitleKey: 'stat.config.wallets.subtitle',
    titleKey: 'stat.config.wallets.title',
  },
}

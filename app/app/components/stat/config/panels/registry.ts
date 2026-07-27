import type { StatConfigPanelId } from '~/components/stat/types'

export type PanelDef = {
  // Dot path to the field the row's subtitle interpolates as `{ count }`.
  countPath?: string
  descKey?: string
  // Dot path to the panel's own isShow boolean in MiniItemConfig.
  showPath: string
  subtitleKey?: string
  titleKey: string
}

export const PANELS: Record<Exclude<StatConfigPanelId, 'root'>, PanelDef> = {
  catsList: {
    descKey: 'stat.config.categories.list.description',
    showPath: 'categories.list.isShow',
    titleKey: 'stat.config.categories.list.title',
  },
  catsRound: {
    descKey: 'stat.config.categories.rounds.description',
    showPath: 'categories.round.isShow',
    titleKey: 'stat.config.categories.rounds.title',
  },
  chart: {
    showPath: 'chart.isShow',
    titleKey: 'stat.config.chartShow.title',
  },
  statAverage: {
    countPath: 'average.count',
    descKey: 'stat.config.statAverage.description',
    showPath: 'average.isShow',
    subtitleKey: 'stat.config.statAverage.subtitle',
    titleKey: 'stat.config.statAverage.title',
  },
  vertical: {
    showPath: 'categories.bars.isShow',
    titleKey: 'stat.config.categories.vertical.title',
  },
  wallets: {
    countPath: 'wallets.count',
    descKey: 'stat.config.wallets.description',
    showPath: 'wallets.isShow',
    subtitleKey: 'stat.config.wallets.subtitle',
    titleKey: 'stat.config.wallets.title',
  },
}

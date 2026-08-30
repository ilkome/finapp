import type { DeepPartial } from '~~/utils/types'

import defu from 'defu'
import { z } from 'zod/v4'

import { chartTypes, defaultLineChartOptions } from '~/components/stat/chart/types'
import { defaultQuickRangeOptionIds, normalizeQuickRangeOrderIds, quickRangeOptionIds } from '~/components/stat/date/useRangeOptions'

export const chartLayoutOptions = ['combined-wide', 'split', 'combined-narrow'] as const
export const chartLayoutIcons: Record<typeof chartLayoutOptions[number], string> = {
  'combined-narrow': 'i-lucide-rectangle-vertical',
  'combined-wide': 'i-lucide-rectangle-horizontal',
  'split': 'i-lucide-columns-2',
}
export const chartValueDisplayOptions = ['magnitude', 'signed'] as const
export const pieShapeOptions = ['donut', 'circle'] as const
export const walletDisplayModes = ['recent', 'period'] as const
export const walletSelectionModes = ['multiple', 'single'] as const
export const categoryGroupingOptions = ['auto', 'parent', 'child'] as const
const leadingStatConfigBlockOrder = ['navigation', 'summary'] as const
export const statReportBlockOrder = ['catsRound', 'catsList', 'vertical', 'trns'] as const
export const statConfigBlockOrder = [...leadingStatConfigBlockOrder, 'wallets', 'chart', ...statReportBlockOrder] as const
export type StatConfigBlockId = typeof statConfigBlockOrder[number]
export type StatReportBlockId = typeof statReportBlockOrder[number]
export type CategoryGrouping = typeof categoryGroupingOptions[number]

const categoryGroupingSchema = z.enum(categoryGroupingOptions)
const statConfigBlockSchema = z.enum(statConfigBlockOrder)

export function normalizeStatConfigBlockOrder(value: unknown): StatConfigBlockId[] {
  const source = Array.isArray(value) ? value : []
  const valid = new Set<StatConfigBlockId>(statConfigBlockOrder)
  const seen = new Set<StatConfigBlockId>()
  const result: StatConfigBlockId[] = []

  for (const item of source) {
    if (valid.has(item as StatConfigBlockId) && !seen.has(item as StatConfigBlockId)) {
      const id = item as StatConfigBlockId
      seen.add(id)
      result.push(id)
    }
  }

  for (const id of [...leadingStatConfigBlockOrder].reverse()) {
    if (!seen.has(id)) {
      seen.add(id)
      result.unshift(id)
    }
  }
  for (const id of statConfigBlockOrder) {
    if (!seen.has(id))
      result.push(id)
  }
  return result
}

function migrateCategoryGrouping(value: unknown): unknown {
  const raw = value as Record<string, unknown> | null
  if (!raw)
    return value
  return {
    ...raw,
    grouping: raw.grouping ?? (typeof raw.isGrouped === 'boolean' ? (raw.isGrouped ? 'parent' : 'child') : 'auto'),
  }
}

function migrateCategoryList(value: unknown): unknown {
  const raw = migrateCategoryGrouping(value) as Record<string, unknown> | null
  if (!raw)
    return value
  return {
    ...raw,
    backgroundType: raw.backgroundType
      ?? (raw.isShowBackground === true ? 'category' : 'none'),
    trendType: raw.trendType ?? 'bar',
  }
}

const categoryListSchema = z.preprocess(migrateCategoryList, z.object({
  backgroundType: z.enum(['category', 'none', 'standard']),
  grouping: categoryGroupingSchema,
  isLines: z.boolean(),
  isRoundIcon: z.boolean(),
  isShow: z.boolean(),
  isShowTitle: z.boolean(),
  trendType: z.enum(['bar', 'bar-plus', 'hidden', 'line']),
}))

const categoryBarsSchema = z.preprocess(migrateCategoryGrouping, z.object({
  grouping: categoryGroupingSchema,
  isShow: z.boolean(),
}))

const categoryRoundSchema = z.preprocess(migrateCategoryGrouping, z.object({
  grouping: categoryGroupingSchema,
  isHideOthersOnSelect: z.boolean(),
  isIconBg: z.boolean(),
  isInlineAmount: z.boolean(),
  isShow: z.boolean(),
  isShowFavorites: z.boolean(),
  isShowRecent: z.boolean(),
}))

export const ConfigSchema = z.object({
  average: z.object({
    count: z.number(),
    isShow: z.boolean(),
  }),
  categories: z.object({
    bars: categoryBarsSchema,
    isShowEmpty: z.boolean(),
    list: categoryListSchema,
    round: categoryRoundSchema,
    view: z.enum(['list', 'round']),
  }),
  chart: z.object({
    breakdown: z.enum(['cashflow', 'categories']),
    isGrouped: z.boolean(),
    isShow: z.boolean(),
    isShowAverage: z.boolean(),
    isShowBackground: z.boolean(),
    isShowScale: z.boolean(),
    layout: z.enum(chartLayoutOptions),
    line: z.object({
      isGradient: z.boolean(),
      isShowPoints: z.boolean(),
      isSkipZero: z.boolean(),
      isSmooth: z.boolean(),
    }),
    pie: z.object({
      isShowLabels: z.boolean(),
      isShowPercent: z.boolean(),
      shape: z.enum(pieShapeOptions),
    }),
    type: z.enum(chartTypes),
    valueDisplay: z.enum(chartValueDisplayOptions),
  }),
  date: z.object({
    isPinned: z.boolean(),
    isShowNavigation: z.boolean(),
    isShowQuick: z.boolean(),
    quickRangeOrderIds: z.preprocess(normalizeQuickRangeOrderIds, z.array(z.enum(quickRangeOptionIds)).length(quickRangeOptionIds.length)),
    quickRangeIds: z.array(z.enum(quickRangeOptionIds)).transform((ids) => {
      const selected = new Set(ids)
      return quickRangeOptionIds.filter(id => selected.has(id))
    }),
  }),
  page: z.object({
    blockOrder: z.preprocess(normalizeStatConfigBlockOrder, z.array(statConfigBlockSchema).length(statConfigBlockOrder.length)),
    layout: z.enum(['combined', 'split']),
  }),
  summary: z.object({
    isPinned: z.boolean(),
    isShowChart: z.boolean(),
  }),
  trns: z.object({
    isShow: z.boolean(),
    isShowHistory: z.boolean(),
    isShowTitle: z.boolean(),
    isShowTypeTabs: z.boolean(),
  }),
  wallets: z.object({
    count: z.number(),
    displayMode: z.enum(walletDisplayModes),
    isShow: z.boolean(),
    isShowIcon: z.boolean(),
    selectionMode: z.enum(walletSelectionModes),
  }),
}).transform(config => config.page.blockOrder.at(-1) === 'trns' || !config.trns.isShowHistory
  ? config
  : {
      ...config,
      trns: {
        ...config.trns,
        isShowHistory: false,
      },
    })

export type MiniItemConfig = z.infer<typeof ConfigSchema>

export const defaultConfig: MiniItemConfig = {
  average: {
    count: 10,
    isShow: false,
  },

  categories: {
    bars: {
      grouping: 'auto',
      isShow: false,
    },
    isShowEmpty: false,
    list: {
      backgroundType: 'none',
      grouping: 'auto',
      isLines: true,
      isRoundIcon: true,
      isShow: true,
      isShowTitle: true,
      trendType: 'bar',
    },
    round: {
      grouping: 'auto',
      isHideOthersOnSelect: false,
      isIconBg: true,
      isInlineAmount: false,
      isShow: true,
      isShowFavorites: false,
      isShowRecent: false,
    },
    view: 'list',
  },

  chart: {
    breakdown: 'cashflow',
    isGrouped: true,
    isShow: true,
    isShowAverage: false,
    isShowBackground: false,
    isShowScale: false,
    layout: 'combined-wide',
    line: defaultLineChartOptions,
    pie: {
      isShowLabels: true,
      isShowPercent: false,
      shape: 'donut',
    },
    type: 'bar',
    valueDisplay: 'magnitude',
  },

  date: {
    isPinned: true,
    isShowNavigation: true,
    isShowQuick: false,
    quickRangeOrderIds: [...quickRangeOptionIds],
    quickRangeIds: [...defaultQuickRangeOptionIds],
  },

  page: {
    blockOrder: [...statConfigBlockOrder],
    layout: 'combined',
  },

  summary: {
    isPinned: true,
    isShowChart: true,
  },

  trns: {
    isShow: true,
    isShowHistory: true,
    isShowTitle: true,
    isShowTypeTabs: true,
  },

  wallets: {
    count: 6,
    displayMode: 'recent',
    isShow: false,
    isShowIcon: true,
    selectionMode: 'multiple',
  },
}

/**
 * Compute a new config by deep-merging a partial update into the current config.
 * Returns the new config, or null if the result fails Zod validation.
 */
export function applyConfigUpdate<K extends keyof MiniItemConfig>(
  current: MiniItemConfig,
  key: K,
  value: DeepPartial<MiniItemConfig[K]>,
): MiniItemConfig | null {
  const mergedValue = defu(value, current[key])
  if (key === 'page' && 'blockOrder' in value && Array.isArray(value.blockOrder))
    (mergedValue as MiniItemConfig['page']).blockOrder = value.blockOrder as MiniItemConfig['page']['blockOrder']
  if (key === 'date' && 'quickRangeIds' in value && Array.isArray(value.quickRangeIds))
    (mergedValue as MiniItemConfig['date']).quickRangeIds = value.quickRangeIds as MiniItemConfig['date']['quickRangeIds']

  const update = {
    ...current,
    [key]: mergedValue,
  }

  const parsed = ConfigSchema.safeParse(update)
  return parsed.success ? parsed.data : null
}

export function applyConfigProps(current: MiniItemConfig, props: DeepPartial<MiniItemConfig>): MiniItemConfig {
  return ConfigSchema.parse(defu(props, current))
}

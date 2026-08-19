import type { DeepPartial } from '~~/utils/types'

import defu from 'defu'
import { z } from 'zod/v4'

import { chartTypes } from '~/components/stat/chart/types'

export const chartLayoutOptions = ['combined-wide', 'split', 'combined-narrow'] as const

export const ConfigSchema = z.object({
  average: z.object({
    count: z.number(),
    isShow: z.boolean(),
  }),
  categories: z.object({
    bars: z.object({
      isGrouped: z.boolean(),
      isShow: z.boolean(),
    }),
    isShowEmpty: z.boolean(),
    list: z.object({
      isGrouped: z.boolean(),
      isLines: z.boolean(),
      isRoundIcon: z.boolean(),
      isShow: z.boolean(),
    }),
    round: z.object({
      isGrouped: z.boolean(),
      isIconBg: z.boolean(),
      isShow: z.boolean(),
      isShowFavorites: z.boolean(),
      isShowRecent: z.boolean(),
    }),
    view: z.enum(['list', 'round']),
  }),
  chart: z.object({
    breakdown: z.enum(['cashflow', 'categories']),
    isGrouped: z.boolean(),
    isShow: z.boolean(),
    isShowAverage: z.boolean(),
    layout: z.enum(chartLayoutOptions),
    type: z.enum(chartTypes),
  }),
  date: z.object({
    isShowQuick: z.boolean(),
  }),
  page: z.object({
    layout: z.enum(['combined', 'split']),
  }),
  trns: z.object({
    isShow: z.boolean(),
  }),
  wallets: z.object({
    count: z.number(),
    isShow: z.boolean(),
    isShowIcon: z.boolean(),
  }),
})

export type MiniItemConfig = z.infer<typeof ConfigSchema>

export const defaultConfig: MiniItemConfig = {
  average: {
    count: 10,
    isShow: false,
  },

  categories: {
    bars: {
      isGrouped: false,
      isShow: false,
    },
    isShowEmpty: false,
    list: {
      isGrouped: true,
      isLines: true,
      isRoundIcon: true,
      isShow: true,
    },
    round: {
      isGrouped: false,
      isIconBg: true,
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
    layout: 'combined-wide',
    type: 'bar',
  },

  date: {
    isShowQuick: false,
  },

  page: {
    layout: 'combined',
  },

  trns: {
    isShow: true,
  },

  wallets: {
    count: 6,
    isShow: false,
    isShowIcon: true,
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
  const update = {
    ...current,
    [key]: defu(value, current[key]),
  }

  if (!ConfigSchema.safeParse(update).success)
    return null

  return update as MiniItemConfig
}

export function applyConfigProps(current: MiniItemConfig, props: DeepPartial<MiniItemConfig>): MiniItemConfig {
  return ConfigSchema.parse(defu(props, current))
}

import type { DeepPartial } from '~~/utils/types'

import defu from 'defu'
import { z } from 'zod/v4'

import type { ChartType } from '~/components/stat/chart/types'

import { chartTypes } from '~/components/stat/chart/types'

export const chartViewOptions = ['half', 'full'] as const

/**
 * Pie is only meaningful for the per-category breakdown. When the chart is
 * aggregated a stored `pie` selection falls back to `bar`, so switching the
 * mode never leaves the chart in an unrenderable state.
 */
export function resolveChartType(raw: ChartType, isByCategories: boolean): ChartType {
  return !isByCategories && raw === 'pie' ? 'bar' : raw
}

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
    isByCategories: z.boolean(),
    isGrouped: z.boolean(),
    isShow: z.boolean(),
    isShowAverage: z.boolean(),
    type: z.enum(chartTypes),
    view: z.enum(chartViewOptions),
  }),
  date: z.object({
    isShowQuick: z.boolean(),
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
    isByCategories: false,
    isGrouped: true,
    isShow: true,
    isShowAverage: false,
    type: 'bar',
    view: 'full',
  },

  date: {
    isShowQuick: false,
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

/** Read a dot path (e.g. 'categories.round.isGrouped') off the config. */
export function getConfigValue(config: MiniItemConfig, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], config)
}

/** Turn a dot path plus a value into the nested partial `updateConfig` expects. */
export function buildConfigPatch(segments: string[], value: unknown): unknown {
  if (segments.length === 0)
    return value
  return { [segments[0]!]: buildConfigPatch(segments.slice(1), value) }
}

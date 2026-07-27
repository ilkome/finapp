import type { DeepPartial } from '~~/utils/types'

import { useStorage } from '@vueuse/core'
import defu from 'defu'
import { z } from 'zod/v4'

import type { ChartType } from '~/components/stat/chart/types'

import { chartTypes } from '~/components/stat/chart/types'
import { applyConfigUpdate } from '~/components/stat/statConfig'

export const chartViewOptions = ['half', 'full'] as const

export type ChartMode = 'aggregated' | 'categories'

/**
 * Pie is only meaningful for the per-category breakdown. When the chart is in
 * aggregated mode a stored `pie` selection falls back to `bar`, so switching
 * modes never leaves the chart in an unrenderable state.
 */
export function resolveChartType(raw: ChartType, mode: ChartMode): ChartType {
  return mode !== 'categories' && raw === 'pie' ? 'bar' : raw
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
    isGrouped: z.boolean(),
    isShow: z.boolean(),
    isShowAverage: z.boolean(),
    mode: z.enum(['aggregated', 'categories']),
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

type StatConfigParams = {
  props?: DeepPartial<MiniItemConfig>
  storageKey: string
}

export function useStatConfig({ props, storageKey }: StatConfigParams) {
  const configStorageKey = computed(() => {
    const query = useRouter().currentRoute.value.query
    const queryKey = Object.entries(query).map(([k, v]) => `${k}=${v}`).join('&')
    return `finapp-${storageKey}-${queryKey}`
  })

  const config = useStorage<MiniItemConfig>(configStorageKey.value, {
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
      isGrouped: true,
      isShow: true,
      isShowAverage: false,
      mode: 'aggregated',
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
  }, localStorage, {
    mergeDefaults: (storageValue, defaults) => defu(storageValue, defaults),
  })

  if (props) {
    Object.entries(props).forEach(([key, value]) => {
      if (value !== undefined) {
        updateConfig(key as keyof MiniItemConfig, value as never)
      }
    })
  }

  function updateConfig<K extends keyof MiniItemConfig>(key: K, value: DeepPartial<MiniItemConfig[K]>) {
    const result = applyConfigUpdate(config.value, key, value)
    if (result)
      config.value = result
  }

  // Tabs only fit on a laptop with a mouse; mobile (and a wide touchscreen) shows
  // the combined summary view instead. One rule, read by Menu/Header/Wrap.
  const showTabs = useIsLaptop()

  return {
    config,
    showTabs,
    updateConfig,
  }
}

export type StatConfigProvider = ReturnType<typeof useStatConfig>

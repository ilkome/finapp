import type { DeepPartial } from '~~/utils/types'

import { useStorage } from '@vueuse/core'
import defu from 'defu'
import { z } from 'zod'

import { chartTypes } from '~/components/stat/chart/types'

export const chartViewOptions = ['half', 'full'] as const

export const ConfigSchema = z.object({
  catsList: z.object({
    isGrouped: z.boolean(),
    isItemsBg: z.boolean(),
    isLines: z.boolean(),
    isRoundIcon: z.boolean(),
    isShow: z.boolean(),
    isShowFavorites: z.boolean(),
    isShowRecent: z.boolean(),
  }),
  catsRound: z.object({
    isGrouped: z.boolean(),
    isShow: z.boolean(),
    isShowFavorites: z.boolean(),
    isShowRecent: z.boolean(),
  }),
  catsView: z.enum(['list', 'round']),
  chart: z.object({
    isShowAverage: z.boolean(),
  }),
  chartShow: z.boolean(),
  chartType: z.enum(chartTypes),
  chartView: z.enum(chartViewOptions),
  date: z.object({
    isShowQuick: z.boolean(),
  }),
  isShowEmptyCategories: z.boolean(),
  statAverage: z.object({
    count: z.number(),
    isShow: z.boolean(),
  }),
  vertical: z.object({
    isGrouped: z.boolean(),
    isShow: z.boolean(),
  }),
  wallets: z.object({
    count: z.number(),
    isShow: z.boolean(),
  }),
})

export type MiniItemConfig = z.infer<typeof ConfigSchema>
export type UpdateConfigFn = <K extends keyof MiniItemConfig>(key: K, value: MiniItemConfig[K]) => void

type StatConfigParams = {
  props?: DeepPartial<MiniItemConfig>
  storageKey: string
}

export function useStatConfig({ props, storageKey }: StatConfigParams) {
  const newBaseStorageKey = computed(() => `finapp-${storageKey}-${JSON.stringify(useRouter().currentRoute.value.query)}`)

  const config = useStorage<MiniItemConfig>(newBaseStorageKey.value, {
    catsList: {
      isGrouped: true,
      isItemsBg: false,
      isLines: true,
      isRoundIcon: true,
      isShow: true,
      isShowFavorites: false,
      isShowRecent: false,
    },
    catsRound: {
      isGrouped: false,
      isShow: true,
      isShowFavorites: false,
      isShowRecent: false,
    },
    catsView: 'list',
    chart: {
      isShowAverage: false,
    },
    chartShow: true,
    chartType: 'bar',
    chartView: 'full',

    date: {
      isShowQuick: false,
    },

    isShowEmptyCategories: false,

    statAverage: {
      count: 10,
      isShow: false,
    },

    vertical: {
      isGrouped: false,
      isShow: false,
    },

    wallets: {
      count: 6,
      isShow: false,
    },
  }, localStorage, {
    mergeDefaults: (storageValue, defaults) => defu(storageValue, defaults),
  })

  if (props) {
    Object.entries(props).forEach(([key, value]) => {
      if (value !== undefined) {
        updateConfig(key as keyof MiniItemConfig, value)
      }
    })
  }

  function updateConfig(key: keyof MiniItemConfig, value: Partial<MiniItemConfig[keyof MiniItemConfig]>) {
    const update = { ...config.value, [key]: typeof value === 'object' ? defu(value, config.value[key]) : value }

    if (!ConfigSchema.safeParse(update).success) {
      return
    }

    config.value = update
  }

  return {
    config,
    updateConfig,
  }
}

export type StatConfigProvider = ReturnType<typeof useStatConfig>

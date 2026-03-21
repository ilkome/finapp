import type { DeepPartial } from '~~/utils/types'

import { useStorage } from '@vueuse/core'
import defu from 'defu'
import { z } from 'zod/v4'

import { chartTypes } from '~/components/stat/chart/types'
import { applyConfigUpdate } from '~/components/stat/statConfig'

export const chartViewOptions = ['half', 'full'] as const

export const ConfigSchema = z.object({
  catsList: z.object({
    isGrouped: z.boolean(),
    isItemsBg: z.boolean(),
    isLines: z.boolean(),
    isRoundIcon: z.boolean(),
    isShow: z.boolean(),
  }),
  catsRound: z.object({
    isGrouped: z.boolean(),
    isShow: z.boolean(),
  }),
  catsView: z.enum(['list', 'round']),
  chart: z.object({
    isShowAverage: z.boolean(),
  }),
  chartType: z.enum(chartTypes),
  chartView: z.enum(chartViewOptions),
  date: z.object({
    isShowQuick: z.boolean(),
  }),
  isChartShow: z.boolean(),
  isShowEmptyCategories: z.boolean(),
  statAverage: z.object({
    count: z.number(),
    isShow: z.boolean(),
  }),
  trns: z.object({
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
    catsList: {
      isGrouped: true,
      isItemsBg: false,
      isLines: true,
      isRoundIcon: true,
      isShow: true,
    },
    catsRound: {
      isGrouped: false,
      isShow: true,
    },
    catsView: 'list',
    chart: {
      isShowAverage: false,
    },
    chartType: 'bar',
    chartView: 'full',
    date: {
      isShowQuick: false,
    },

    isChartShow: true,

    isShowEmptyCategories: false,

    statAverage: {
      count: 10,
      isShow: false,
    },

    trns: {
      isShow: true,
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
    const result = applyConfigUpdate(config.value, key, value)
    if (result)
      config.value = result
  }

  return {
    config,
    updateConfig,
  }
}

export type StatConfigProvider = ReturnType<typeof useStatConfig>

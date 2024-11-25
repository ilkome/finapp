import { useStorage } from '@vueuse/core'
import { z } from 'zod'
import { chartTypes } from '~/components/stat/chart/types'
import type { DeepPartial } from '~~/utils/types'

export const chartViewOptions = ['half', 'full'] as const

const ConfigSchema = z.object({
  catsList: z.object({
    isGrouped: z.boolean(),
    isItemsBg: z.boolean(),
    isLines: z.boolean(),
    isOpened: z.boolean(),
    isRoundIcon: z.boolean(),
    isShowFavorites: z.boolean(),
    isShowRecent: z.boolean(),
  }),
  catsRound: z.object({
    isGrouped: z.boolean(),
    isShowFavorites: z.boolean(),
    isShowRecent: z.boolean(),
  }),

  catsView: z.enum(['list', 'round']),
  chartShow: z.boolean(),
  chartType: z.enum(chartTypes),
  chartView: z.enum(chartViewOptions),
  isCategoryPage: z.boolean(),
  isShowCategoriesVertical: z.boolean(),
  isShowEmptyCategories: z.boolean(),
  showedWallets: z.number(),
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
      isOpened: false,
      isRoundIcon: true,
      isShowFavorites: false,
      isShowRecent: false,
    },
    catsRound: {
      isGrouped: false,
      isShowFavorites: false,
      isShowRecent: false,
    },
    catsView: 'list',
    chartShow: true,
    chartType: 'bar',
    chartView: 'half',
    isCategoryPage: false,
    isShowCategoriesVertical: true,
    isShowEmptyCategories: false,
    showedWallets: 0,
  }, localStorage, {
    mergeDefaults: true,
  })

  if (props) {
    for (const key in props) {
      if (props[key] !== undefined) {
        updateConfig(key, props[key])
      }
    }
  }

  function updateConfig(key: keyof MiniItemConfig, value: MiniItemConfig[keyof MiniItemConfig]) {
    const update = { ...config.value, [key]: value }

    if (!ConfigSchema.safeParse(update).success) {
      console.log('error')
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

import { useStorage } from '@vueuse/core'
import { z } from 'zod'
import { chartViewOptions } from '~/components/stat/types'
import { chartTypes } from '~/components/stat/chart/types'

const ConfigSchema = z.object({
  chartShow: z.boolean(),
  chartType: z.enum(chartTypes),
  chartView: z.enum(chartViewOptions),
  isShowCategoriesVertical: z.boolean(),
  isShowEmptyCategories: z.boolean(),
  showedWallets: z.number(),
})

export type MiniItemConfig = z.infer<typeof ConfigSchema>
export type UpdateConfigFn = <K extends keyof MiniItemConfig>(key: K, value: MiniItemConfig[K]) => void

type StatConfigParams = {
  props?: Partial<MiniItemConfig>
  storageKey: string
}

export function useStatConfig({ props, storageKey }: StatConfigParams) {
  const newBaseStorageKey = computed(() => `finapp-${storageKey}-${JSON.stringify(useRouter().currentRoute.value.query)}`)

  const config = useStorage<MiniItemConfig>(newBaseStorageKey.value, {
    chartShow: true,
    chartType: 'bar',
    chartView: 'half',
    isShowCategoriesVertical: true,
    isShowEmptyCategories: false,
    showedWallets: 0,
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

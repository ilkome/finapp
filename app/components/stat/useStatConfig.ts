import { useStorage } from '@vueuse/core'
import type { MiniItemConfig, UpdateConfigFn } from '~/components/stat/types'

export function useStatConfig({ storageKey }: { storageKey: string }) {
  const newBaseStorageKey = computed(() => `finapp-${storageKey}-${JSON.stringify(useRouter().currentRoute.value.query)}`)

  const config = useStorage<MiniItemConfig>(newBaseStorageKey.value, {
    chartShow: true,
    chartType: 'bar',
    chartView: 'half',
    showedWallets: 5,
  })

  const updateConfig: UpdateConfigFn = (key, value) => {
    config.value[key] = value
  }

  return {
    config,
    updateConfig,
  }
}

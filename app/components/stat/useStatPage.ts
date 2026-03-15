import type { DeepPartial } from '~~/utils/types'

import { useStorage } from '@vueuse/core'

import type { FilterProvider } from '~/components/stat/filter/types'
import type { StatTabSlug } from '~/components/stat/types'
import type { MiniItemConfig } from '~/components/stat/useStatConfig'
import type { TrnsGetterProps } from '~/components/trns/types'

import { useStatDate } from '~/components/date/useStatDate'
import { useFilter } from '~/components/stat/filter/useFilter'
import { filterKey, statConfigKey, statDateKey } from '~/components/stat/injectionKeys'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

type UseStatPageOptions = {
  getTrnsFilter: (ctx: {
    activeTab: Ref<StatTabSlug>
    filter: FilterProvider
  }) => TrnsGetterProps
  statConfigProps?: DeepPartial<MiniItemConfig>
  storageKeyPrefix: string
  syncEmptyCategoriesWithFilter?: boolean
}

export function useStatPage(options: UseStatPageOptions) {
  const route = useRoute()
  const trnsStore = useTrnsStore()

  const filter = useFilter()
  provide(filterKey, filter)

  const activeTab = useStorage<StatTabSlug>(`${options.storageKeyPrefix}-tab`, 'summary')
  const storageKey = computed(() => `${options.storageKeyPrefix}-${activeTab.value}`)

  const trnsIds = computed(() =>
    trnsStore.getStoreTrnsIds(options.getTrnsFilter({ activeTab, filter })),
  )

  const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

  const statConfig = useStatConfig({
    props: options.statConfigProps,
    storageKey: storageKey.value,
  })
  provide(statConfigKey, statConfig)

  const statDate = useStatDate({
    key: storageKey.value,
    maxRange,
    queryParams: route.query,
  })
  provide(statDateKey, statDate)

  if (options.syncEmptyCategoriesWithFilter) {
    watch(filter.categoriesIds, () => {
      statConfig.config.value.isShowEmptyCategories = filter.categoriesIds.value.length > 0
    })
  }

  return {
    activeTab,
    filter,
    maxRange,
    statConfig,
    statDate,
    storageKey,
    trnsIds,
  }
}

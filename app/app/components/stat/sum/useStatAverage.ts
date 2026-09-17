import type { CategoryId } from '~/components/categories/types'
import type { SeriesSlugSelected } from '~/components/stat/types'
import type { WalletId } from '~/components/wallets/types'

import { useAmount } from '~/components/amount/useAmount'
import { filterKey } from '~/components/filter/injectionKeys'
import { getPreviousPeriodsRange } from '~/components/stat/averageWindow'
import { useStatConfigCtx } from '~/components/stat/config/useStatConfigCtx'
import { statDateKey } from '~/components/stat/injectionKeys'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

/** Average expense / income / net per period over the previous `average.count` periods, or null when the block is off. */
export function useStatAverage(scope: {
  categoryId: MaybeRefOrGetter<CategoryId | undefined>
  walletId: MaybeRefOrGetter<WalletId | undefined>
}) {
  const filter = inject(filterKey)!
  const statConfig = useStatConfigCtx()
  const statDate = inject(statDateKey)!
  const trnsStore = useTrnsStore()
  const { computeTotalForTrnsIds } = useAmount()

  const isShow = computed(() => statConfig.average.value.isShow)
  const count = computed(() => statConfig.average.value.count)
  const dates = computed(() => getPreviousPeriodsRange(statDate.params.value, count.value, new Date()))

  const total = computed(() => {
    const categoryId = toValue(scope.categoryId)
    const walletId = toValue(scope.walletId)
    return computeTotalForTrnsIds(trnsStore.getStoreTrnsIds({
      categoriesIds: categoryId ? [...filter.categoriesIds.value, categoryId] : filter.categoriesIds.value,
      dates: { end: dates.value.end, start: dates.value.start },
      walletsIds: walletId ? [...filter.walletsIds.value, walletId] : filter.walletsIds.value,
    }))
  })

  const averages = computed<Record<SeriesSlugSelected, number> | null>(() => isShow.value
    ? {
        expense: total.value.expense / count.value,
        income: total.value.income / count.value,
        net: total.value.net / count.value,
      }
    : null)

  return { averages, isShow }
}

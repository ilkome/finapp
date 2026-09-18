import { todayCivilDayEpoch } from '~~/utils/date/civil'

import type { CategoryId } from '~/components/categories/types'

import { statDateKey } from '~/components/stat/injectionKeys'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

/** Long press on a category row opens the form for that category, dated to the selected day when one is selected. */
export function useCategoryQuickAdd() {
  const statDate = inject(statDateKey)!
  const trnsFormStore = useTrnsFormStore()

  function openFormForCategory(categoryId: CategoryId) {
    const isDayDate = statDate.params.value.intervalSelected !== -1 && statDate.params.value.granularityBy === 'day'
    const date = isDayDate && statDate.selectedInterval.value?.start
      ? statDate.selectedInterval.value.start
      : todayCivilDayEpoch()
    trnsFormStore.openFormForCategory(categoryId, date)
  }

  return { openFormForCategory }
}

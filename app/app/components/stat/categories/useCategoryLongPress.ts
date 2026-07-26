import type { CategoryId } from '~/components/categories/types'

import { todayCivilDayEpoch } from '~~/utils/date/civil'
import { statDateKey } from '~/components/stat/injectionKeys'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

export function useCategoryLongPress(
  categoryId: () => CategoryId,
  onShortPress: () => void,
) {
  const statDate = inject(statDateKey)!
  const trnsFormStore = useTrnsFormStore()

  const longPressRef = ref(null)

  onLongPress(
    longPressRef,
    () => {
      const isDayDate = statDate.params.value.intervalSelected !== -1 && statDate.params.value.intervalsBy === 'day'
      const date = isDayDate && statDate.selectedInterval.value?.start
        ? statDate.selectedInterval.value.start
        : todayCivilDayEpoch()

      trnsFormStore.openFormForCategory(categoryId(), date)
    },
    {
      onMouseUp: (duration: number, distance: number, isLongPress: boolean) => {
        if (!isLongPress && distance < 100) {
          onShortPress()
        }
      },
    },
  )

  return {
    longPressRef,
  }
}

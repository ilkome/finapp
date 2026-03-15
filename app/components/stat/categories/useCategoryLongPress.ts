import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { statDateKey } from '~/components/stat/injectionKeys'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

export function useCategoryLongPress(
  categoryId: () => CategoryId,
  onShortPress: () => void,
) {
  const statDate = inject(statDateKey)!
  const categoriesStore = useCategoriesStore()
  const trnsFormStore = useTrnsFormStore()

  const longPressRef = ref(null)

  onLongPress(
    longPressRef,
    () => {
      const isTransactible = categoriesStore.isTransactible(categoryId())
      if (!isTransactible)
        return

      trnsFormStore.openFormForCreate()
      trnsFormStore.$patch((state) => {
        state.values.amount = [0, 0, 0]
        state.values.amountRaw = ['', '', '']
        state.values.categoryId = categoryId()
        state.ui.isShow = true

        const isDayDate = statDate.params.value.intervalSelected !== -1 && statDate.params.value.intervalsBy === 'day'
        if (isDayDate && statDate.selectedInterval.value?.start) {
          state.values.date = statDate.selectedInterval.value!.start
        }
        else {
          state.values.date = Date.now()
        }
      })
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

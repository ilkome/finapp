import type { MaybeElementRef } from '@vueuse/core'

import { onLongPress } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'

/** A held press opens the quick-add form; a short press that did not drag (< 100px) is a click. */
export function useLongPressClick(
  target: MaybeElementRef,
  id: () => CategoryId,
  handlers: { onClick: (categoryId: CategoryId) => void, onLongPress: (categoryId: CategoryId) => void },
) {
  onLongPress(target, () => handlers.onLongPress(id()), {
    onMouseUp: (_duration, distance, isLongPress) => {
      if (!isLongPress && distance < 100)
        handlers.onClick(id())
    },
  })
}

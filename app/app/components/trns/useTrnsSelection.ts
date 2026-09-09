import type { ComputedRef, Ref } from 'vue'

import { computed, ref } from 'vue'

import type { TrnId } from '~/components/trns/types'

export type TrnsSelection = {
  clear: () => void
  count: ComputedRef<number>
  has: (id: TrnId) => boolean
  ids: Ref<TrnId[]>
  toggle: (id: TrnId) => void
}

export function useTrnsSelection(): TrnsSelection {
  const ids = ref<TrnId[]>([])

  function has(id: TrnId) {
    return ids.value.includes(id)
  }

  function toggle(id: TrnId) {
    ids.value = has(id)
      ? ids.value.filter(selectedId => selectedId !== id)
      : [...ids.value, id]
  }

  function clear() {
    ids.value = []
  }

  return {
    clear,
    count: computed(() => ids.value.length),
    has,
    ids,
    toggle,
  }
}

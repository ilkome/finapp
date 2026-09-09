import type { ComputedRef, Ref } from 'vue'

import { computed, ref } from 'vue'

import type { TrnId } from '~/components/trns/types'

export type TrnsSelection = {
  clear: () => void
  count: ComputedRef<number>
  has: (id: TrnId) => boolean
  ids: Ref<TrnId[]>
  toggle: (id: TrnId) => void
  toggleMany: (ids: TrnId[]) => void
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

  // Selects the whole group, or deselects it when every id is already selected.
  function toggleMany(group: TrnId[]) {
    if (!group.length)
      return

    if (group.every(has)) {
      const removed = new Set(group)
      ids.value = ids.value.filter(id => !removed.has(id))
      return
    }

    ids.value = [...ids.value, ...group.filter(id => !has(id))]
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
    toggleMany,
  }
}

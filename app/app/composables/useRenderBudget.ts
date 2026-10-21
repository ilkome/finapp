import type { Ref } from 'vue'

import { useIntersectionObserver } from '@vueuse/core'
import { computed, ref } from 'vue'

/**
 * A long list mounts in chunks: rendering every row at once stalls the frame that opens its drawer.
 * The template renders `budget` rows and, while more are left, a sentinel keyed by `budget` after them;
 * each time the sentinel comes within a screen of the scroller's bottom, the next chunk mounts. The key
 * remounts the sentinel, so a fresh observation reports it again while it is still near.
 *
 * The margin works only against the list's own scroller (`scrollerSelector`): the viewport would see the
 * sentinel already clipped by it. Without one (a dialog on wider screens) the viewport is the root.
 */
export function useRenderBudget(chunk: number, sentinel: Readonly<Ref<HTMLElement | null>>, scrollerSelector: string) {
  const budget = ref(chunk)
  const root = computed(() => sentinel.value?.closest<HTMLElement>(scrollerSelector) ?? undefined)
  useIntersectionObserver(sentinel, ([entry]) => {
    if (entry?.isIntersecting)
      budget.value += chunk
  }, { root, rootMargin: '0px 0px 100% 0px' })

  return {
    budget,
    reset: () => {
      budget.value = chunk
    },
  }
}

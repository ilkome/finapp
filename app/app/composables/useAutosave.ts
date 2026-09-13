import type { WatchSource } from 'vue'

import { debounce } from 'es-toolkit'
import { getCurrentInstance, onBeforeUnmount, watch } from 'vue'

/**
 * Debounced persist for locally edited state: every change schedules `save`,
 * and unmount flushes so a close right after the last edit never loses it.
 */
export function useAutosave(source: WatchSource | WatchSource[], save: () => void, wait = 300) {
  const persist = debounce(save, wait)
  watch(source, () => persist(), { deep: true })
  if (getCurrentInstance())
    onBeforeUnmount(() => persist.flush())
  return persist
}

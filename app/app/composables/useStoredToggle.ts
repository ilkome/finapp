import { useStorage } from '@vueuse/core'

// One choke point for the collapse-state storage key: guarantees the `finapp-` namespace
// without double-prefixing callers that already include it.
export function useStoredToggle(key: string, initial: boolean) {
  return useStorage(key.startsWith('finapp-') ? key : `finapp-${key}`, initial)
}

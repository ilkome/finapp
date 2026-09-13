import type { SyncStatusSnapshot } from '~~/services/powersync/db'

import { subscribeSyncStatus } from '~~/services/powersync/db'

import { useDemo } from '~/components/demo/useDemo'
import { useUserStore } from '~/components/user/useUserStore'

// Module-level so every caller (menu badge, account panel) shares one subscription.
const status = ref<SyncStatusSnapshot>({ connected: true, pending: 0, uploadError: null })
let armed = false

/** Connection + unsynced-queue state for the UI. Subscribes once, as soon as a real user is signed in. */
export function useSyncStatus() {
  const userStore = useUserStore()
  const { isDemo } = useDemo()

  // uid resolves asynchronously after the first render, so subscribe from a watch, not at call time.
  // The watch binds to the first caller's scope (the header menu, which lives as long as the app).
  if (import.meta.client && !armed) {
    armed = true
    let stop: (() => void) | null = null
    watch(
      () => userStore.uid,
      (uid) => {
        if (uid && !isDemo.value && !stop) {
          stop = subscribeSyncStatus((next) => {
            status.value = next
          })
        }
        else if (!uid && stop) {
          stop()
          stop = null
          status.value = { connected: true, pending: 0, uploadError: null }
        }
      },
      { immediate: true },
    )
  }

  return {
    hasIssue: computed(() => !!status.value.uploadError || status.value.pending > 0 || !status.value.connected),
    status,
  }
}

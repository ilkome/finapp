import { connectPowerSync, forceResync, getPendingUploadCount, getPowerSyncDb, pausePowerSync } from '~~/services/powersync/db'
import { deleteRow, deleteTrnsReferencing } from '~~/services/powersync/mutations'
import { setUploadErrorHandler } from '~~/services/powersync/uploadErrorHandler'
import { planDivergence } from '~~/services/powersync/uploadReconcile'

import { useInitApp } from '~/components/app/useInitApp'
import { useDemo } from '~/components/demo/useDemo'
import { hasPersistedSession } from '~/composables/useAuthSession'
import { showActionToast, showErrorToast } from '~/composables/useStoreSync'
import { useSupabase, useSupabaseAuth } from '~/composables/useSupabase'
import { createLogger } from '~/utils/logger'

const logger = createLogger('powersync-plugin')

export default defineNuxtPlugin(() => {
  // Protect IndexedDB (PowerSync's local store) from eviction on low storage.
  navigator.storage?.persist?.()

  const config = useRuntimeConfig()
  const powerSyncUrl = config.public.powersyncUrl as string
  const client = useSupabase()
  const { isDemo } = useDemo()
  const { isAuthReady, uid } = useSupabaseAuth()

  // Open local SQLite immediately for an already-logged-in user so the cold-start DB
  // init overlaps app boot instead of waiting for the async session to resolve.
  if (!isDemo.value && hasPersistedSession()) {
    getPowerSyncDb().then(db => db.init()).catch(e => logger.error('eager db init failed', e))
    // Seed the stores from the last session's snapshot now (parallel with db.init), before the
    // layout's useAsyncData('app') runs, so the dashboard paints with data on the first render.
    void useInitApp().primeStoresFromCache()
  }

  // Reconcile local rows after a write was fatally rejected by the server and discarded.
  setUploadErrorHandler((_error, divergedOps) => {
    const plan = planDivergence(divergedOps)
    if (plan.needsReload) {
      // Rejected UPDATE/DELETE: offer a full reload (wipe + re-pull server truth). Destructive.
      showActionToast(
        'error',
        'sync.errors.uploadDiverged',
        'sync.actions.reloadFromServer',
        () => {
          if (uid.value)
            void forceResync(client, powerSyncUrl, uid.value)
        },
      )
    }
    else if (plan.toRevert.length) {
      // Rejected INSERT(s): delete the local rows to converge. A reverted wallet/category also
      // cascades to local trns referencing it, so no orphans survive. Defer out of the
      // uploadData call stack (setTimeout 0) so the new write transaction doesn't contend
      // for the lock.
      for (const { id, table } of plan.toRevert) {
        setTimeout(() => {
          void deleteRow(table, id)
          if (table === 'wallets' || table === 'categories')
            void deleteTrnsReferencing(table, id)
        }, 0)
      }
      showErrorToast('sync.errors.uploadReverted')
    }
  })

  // Drive the PowerSync connection from the auth session.
  watch(
    uid,
    (userId) => {
      if (isDemo.value)
        return

      if (userId) {
        connectPowerSync(client, powerSyncUrl, userId).catch(e => logger.error('connect failed', e))
      }
      // Session lost while resolved (the initial cold-start null is skipped via isAuthReady).
      // This is NOT the explicit sign-out path - useUserStore.signOut() wipes locally itself
      // before this fires - so it's an involuntary loss (token revoked/expired). Keep the local
      // data + unsynced queue and only pause syncing; re-auth as the same user drains the queue.
      // Wiping here would silently discard offline writes that never reached the server.
      else if (isAuthReady.value) {
        pausePowerSync()
          .then(() => getPendingUploadCount())
          .then((pending) => {
            if (pending > 0) {
              showActionToast(
                'warning',
                'sync.errors.sessionLostPending',
                'sync.actions.reauth',
                () => { void navigateTo('/login') },
                { count: pending },
              )
            }
          })
          .catch(e => logger.error('pause failed', e))
      }
    },
    { immediate: true },
  )
})

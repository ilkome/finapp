import { setUploadErrorHandler } from '~~/services/powersync/connector'
import { connectPowerSync, disconnectPowerSync, forceResync, usePowerSyncDb } from '~~/services/powersync/db'
import { deleteRow } from '~~/services/powersync/mutations'
import { planDivergence } from '~~/services/powersync/uploadReconcile'

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
  if (!isDemo.value && hasPersistedSession())
    usePowerSyncDb().init().catch(e => logger.error('eager db init failed', e))

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
      // Rejected INSERT(s): delete the local rows to converge. Defer out of the uploadData
      // call stack (setTimeout 0) so the new write transaction doesn't contend for the lock.
      for (const { id, table } of plan.toRevert)
        setTimeout(() => { void deleteRow(table, id) }, 0)
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
      // Only disconnect+wipe on a genuine sign-out (auth resolved, no user). The initial
      // null on cold start (session not resolved yet) must NOT wipe a returning user's data.
      else if (isAuthReady.value) {
        disconnectPowerSync().catch(e => logger.error('disconnect failed', e))
      }
    },
    { immediate: true },
  )
})

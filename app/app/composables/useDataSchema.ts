import localforage from 'localforage'
import { isDataSchemaCurrent, markDataSchemaCurrent, wipeOutdatedLocalDb } from '~~/services/powersync/db'

import { clearStoreCache } from '~/composables/useStoreCache'
import { createLogger } from '~/utils/logger'

const logger = createLogger('data-schema')

let ready: Promise<void> | null = null

/**
 * Drops everything stored locally under another data schema before any store reads it: local SQLite (synced
 * again), the cold-start snapshot, and the demo's data. A demo user starts over from the login screen.
 */
export function ensureDataSchema(): Promise<void> {
  ready ??= (async () => {
    if (isDataSchemaCurrent())
      return
    const isDemo = useCookie<boolean | undefined>('finapp.isDemo')
    try {
      await wipeOutdatedLocalDb()
      await clearStoreCache()
      if (isDemo.value) {
        await localforage.clear()
        isDemo.value = undefined
        useCookie<boolean>('finapp.isOnboarded').value = false
      }
      markDataSchemaCurrent()
      logger.log('dropped local data of another schema')
    }
    catch (e) {
      logger.error('dropping outdated local data failed', e)
    }
  })()
  return ready
}

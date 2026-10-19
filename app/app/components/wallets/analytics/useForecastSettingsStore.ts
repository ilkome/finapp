import type { Row } from '~~/services/powersync/transforms'

import localforage from 'localforage'
import { defineStore } from 'pinia'
import { watchTable } from '~~/services/powersync/db'
import { upsertRow } from '~~/services/powersync/mutations'

import type { ForecastSettings } from '~/components/wallets/analytics/forecastSettings'

import { useDemo } from '~/components/demo/useDemo'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { parseForecastSettings } from '~/components/wallets/analytics/forecastSettings'
import { resolveWriteUid } from '~/composables/useAuthSession'
import { createDebouncedPersist, persistOptimistic } from '~/composables/useStoreSync'
import { useSupabaseAuth } from '~/composables/useSupabase'
import { createLogger } from '~/utils/logger'

const logger = createLogger('forecastSettings')

/** Synced forecast assumptions; subscribes on first use, since only the wallets analytics read them. */
export const useForecastSettingsStore = defineStore('forecastSettings', () => {
  const { isDemo } = useDemo()
  const { uid } = useSupabaseAuth()
  const settings = shallowRef<ForecastSettings>(parseForecastSettings(null))
  const persistDemo = createDebouncedPersist<ForecastSettings>(STORAGE_KEYS.forecastSettings)

  if (isDemo.value) {
    localforage.getItem(STORAGE_KEYS.forecastSettings).then((raw) => {
      settings.value = parseForecastSettings(raw)
    })
  }
  else {
    let lastRaw: unknown
    watchTable<Row>('SELECT "forecastSettings" FROM user_settings LIMIT 1', [], (rows) => {
      // Every user_settings write re-emits: skip when this column is unchanged.
      if (!rows[0] || rows[0].forecastSettings === lastRaw)
        return
      lastRaw = rows[0].forecastSettings
      settings.value = parseForecastSettings(lastRaw)
    })
  }

  function update(patch: Partial<ForecastSettings>) {
    const prev = settings.value
    const next = parseForecastSettings({ ...prev, ...patch })
    settings.value = next

    if (isDemo.value) {
      persistDemo(next)
      return
    }

    const userId = resolveWriteUid(uid.value)
    persistOptimistic(upsertRow('user_settings', userId, { forecastSettings: JSON.stringify(next), userId }), {
      errorKey: 'wallets.analytics.errors.saveFailed',
      label: 'saveForecastSettings',
      logger,
      rollback: () => settings.value = prev,
    })
  }

  return { settings, update }
})

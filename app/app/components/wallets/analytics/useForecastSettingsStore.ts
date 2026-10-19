import type { Row } from '~~/services/powersync/transforms'

import localforage from 'localforage'
import { defineStore } from 'pinia'
import { itemToRow, rowToItem } from '~~/services/powersync/columns'
import { watchTable } from '~~/services/powersync/db'
import { deleteRow, upsertRow } from '~~/services/powersync/mutations'

import type { CategoryId } from '~/components/categories/types'
import type { ForecastCategories, ForecastCategory, ForecastSettings } from '~/components/wallets/analytics/forecastSettings'

import { useDemo } from '~/components/demo/useDemo'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { parseForecastCategories, parseForecastSettings } from '~/components/wallets/analytics/forecastSettings'
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
  const categories = shallowRef<ForecastCategories>({})
  const persistDemoSettings = createDebouncedPersist<ForecastSettings>(STORAGE_KEYS.forecastSettings)
  const persistDemoCategories = createDebouncedPersist<ForecastCategories>(STORAGE_KEYS.forecastCategories)

  if (isDemo.value) {
    localforage.getItem(STORAGE_KEYS.forecastSettings).then(raw => settings.value = parseForecastSettings(raw))
    localforage.getItem(STORAGE_KEYS.forecastCategories).then(raw => categories.value = parseForecastCategories(raw))
  }
  else {
    watchTable<Row>('SELECT * FROM forecast_settings LIMIT 1', [], (rows) => {
      settings.value = parseForecastSettings(rows[0] ? rowToItem('forecast_settings', rows[0]) : null)
    })
    watchTable<Row>('SELECT * FROM forecast_categories', [], (rows) => {
      categories.value = parseForecastCategories(rows.map(row => rowToItem('forecast_categories', row)))
    })
  }

  const ownedFields = (userId: string) => {
    const now = Date.now()
    return { createdAt: now, updatedAt: now, userId }
  }

  function update(patch: Partial<ForecastSettings>) {
    const prev = settings.value
    const next = parseForecastSettings({ ...prev, ...patch })
    settings.value = next

    if (isDemo.value) {
      persistDemoSettings(next)
      return
    }

    const userId = resolveWriteUid(uid.value)
    persistOptimistic(upsertRow('forecast_settings', userId, itemToRow('forecast_settings', { ...next, ...ownedFields(userId) })), {
      errorKey: 'wallets.analytics.errors.saveFailed',
      label: 'saveForecastSettings',
      logger,
      rollback: () => settings.value = prev,
    })
  }

  /** Sets a category's manual choice; undefined drops it back to detection. */
  function setCategory(categoryId: CategoryId, item: Omit<ForecastCategory, 'categoryId'> | undefined) {
    const prev = categories.value
    const next = { ...prev }
    if (item)
      next[categoryId] = { ...item, categoryId }
    else
      delete next[categoryId]
    categories.value = next

    if (isDemo.value) {
      persistDemoCategories(next)
      return
    }

    const userId = resolveWriteUid(uid.value)
    const id = `${userId}:${categoryId}`
    const write = item
      ? upsertRow('forecast_categories', id, itemToRow('forecast_categories', { ...next[categoryId], ...ownedFields(userId) }))
      : deleteRow('forecast_categories', id)
    persistOptimistic(write, {
      errorKey: 'wallets.analytics.errors.saveFailed',
      label: 'saveForecastCategory',
      logger,
      rollback: () => categories.value = prev,
    })
  }

  return { categories, setCategory, settings, update }
})

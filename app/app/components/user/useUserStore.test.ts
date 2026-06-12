import localforage from 'localforage'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { useUserStore } from '~/components/user/useUserStore'

const h = vi.hoisted(() => ({
  auth: { session: { value: null }, signOut: vi.fn(), uid: { value: 'u1' }, user: { value: null } },
  deleteRow: vi.fn(),
  demo: { value: false },
  disconnectPowerSync: vi.fn(async () => true),
  getPowerSyncDb: vi.fn(async () => ({ execute: vi.fn() })),
  upsertRow: vi.fn(),
  upsertRows: vi.fn(),
  watchTable: vi.fn(() => ({ abort: vi.fn() })),
}))

vi.mock('localforage', () => ({ default: { clear: vi.fn(), getItem: vi.fn(), removeItem: vi.fn(), setItem: vi.fn() } }))
vi.mock('~~/services/powersync/db', () => ({ disconnectPowerSync: h.disconnectPowerSync, getPowerSyncDb: h.getPowerSyncDb, watchTable: h.watchTable }))
vi.mock('~~/services/powersync/mutations', () => ({ deleteRow: h.deleteRow, upsertRow: h.upsertRow, upsertRows: h.upsertRows }))
vi.mock('~/components/demo/useDemo', () => ({ useDemo: () => ({ isDemo: h.demo }) }))
vi.mock('~/composables/useSupabase', () => ({ useSupabase: () => ({}), useSupabaseAuth: () => h.auth }))

const setItem = vi.mocked(localforage.setItem)

const sampleUser = { displayName: 'Ilya', email: 'a@b.c', photoURL: null, uid: 'u1' }

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    h.demo.value = false
    setItem.mockClear()
  })

  describe('setUser localforage gating (real mode is the source of truth)', () => {
    it('does NOT persist the user to localforage in real mode', () => {
      useUserStore().setUser(sampleUser)
      expect(setItem).not.toHaveBeenCalled()
    })

    it('persists the user to localforage in demo mode', () => {
      h.demo.value = true
      useUserStore().setUser(sampleUser)
      expect(setItem).toHaveBeenCalledWith(STORAGE_KEYS.user, expect.objectContaining({ email: 'a@b.c', uid: 'u1' }))
    })
  })

  describe('persistUserSettings localforage gating', () => {
    it('does NOT persist settings to localforage in real mode', () => {
      useUserStore().setUserBaseCurrency('EUR')
      expect(setItem).not.toHaveBeenCalled()
    })

    it('persists settings to localforage in demo mode', () => {
      h.demo.value = true
      const store = useUserStore()
      store.setUserBaseCurrency('EUR')
      expect(store.baseCurrency).toBe('EUR')
      expect(setItem).toHaveBeenCalledWith(STORAGE_KEYS.userSettings, expect.objectContaining({ baseCurrency: 'EUR' }))
    })
  })

  it('no longer carries the removed offline-queue keys in STORAGE_KEYS', () => {
    expect(Object.values(STORAGE_KEYS)).not.toContain('finapp.offlineQueue')
    expect(Object.keys(STORAGE_KEYS)).not.toContain('offlineQueue')
  })
})

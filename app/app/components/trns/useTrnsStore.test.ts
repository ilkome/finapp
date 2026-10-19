import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { TrnItem } from '~/components/trns/types'

import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { AUTH_STORAGE_KEY } from '~/composables/useAuthSession'
import { toastAddMock } from '~/test-utils/setup-store'

// Mock the PowerSync data layer so the store talks to a controllable fake:
// `watchTable` captures its callback (to drive hydration), the mutations record
// calls and let us force rejections (to test optimistic rollback), `useDemo`
// flips real/demo mode, and `useSupabaseAuth` supplies a stable uid.
const h = vi.hoisted(() => {
  const watchCallbacks: ((rows: any[]) => void)[] = []
  return {
    auth: { session: { value: null }, signOut: vi.fn(), uid: { value: 'u1' as string | null }, user: { value: null } },
    deleteRow: vi.fn(),
    deleteRows: vi.fn(),
    demo: { value: false },
    upsertRow: vi.fn(),
    upsertRows: vi.fn(),
    watchCallbacks,
    watchTable: vi.fn((_sql: string, _params: unknown[], cb: (rows: any[]) => void) => {
      watchCallbacks.push(cb)
      return { abort: vi.fn() }
    }),
  }
})

vi.mock('~~/services/powersync/db', () => ({ watchTable: h.watchTable }))
vi.mock('~~/services/powersync/mutations', () => ({ deleteRow: h.deleteRow, deleteRows: h.deleteRows, upsertRow: h.upsertRow, upsertRows: h.upsertRows }))
vi.mock('~/components/demo/useDemo', () => ({ useDemo: () => ({ isDemo: h.demo }) }))
vi.mock('~/composables/useSupabase', () => ({ useSupabase: () => ({}), useSupabaseAuth: () => h.auth }))

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0))

function expense(over: Partial<TrnItem> = {}): TrnItem {
  return { categoryId: 'food', createdAt: 1, date: 1699920000000, fromAmount: 100, fromWalletId: 'cash', type: 'expense', updatedAt: 1, ...over }
}

function expenseRow(id: string, updatedAt: number, amount = 100) {
  return { category_id: 'food', created_at: 1, date: 1699920000000, from_amount: amount, from_wallet_id: 'cash', id, type: 'expense', updated_at: updatedAt }
}

describe('useTrnsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    h.demo.value = false
    h.auth.uid.value = 'u1'
    localStorage.clear()
    h.watchCallbacks.length = 0
    h.upsertRow.mockReset().mockResolvedValue(undefined)
    h.upsertRows.mockReset().mockResolvedValue(undefined)
    h.deleteRow.mockReset().mockResolvedValue(undefined)
    h.deleteRows.mockReset().mockResolvedValue(undefined)
  })

  describe('hydration via watch', () => {
    it('subscribes to the trns table and builds items from row snapshots', () => {
      const store = useTrnsStore()
      store.initTrns()

      expect(h.watchTable).toHaveBeenCalledTimes(1)
      expect(h.watchTable.mock.calls[0]?.[0]).toBe('SELECT * FROM transactions')

      const emit = h.watchCallbacks[0]!
      emit([expenseRow('a', 1), expenseRow('b', 2)])

      expect(Object.keys(store.items ?? {})).toEqual(['a', 'b'])
      expect(store.items?.a).toMatchObject({ categoryId: 'food', fromAmount: 100, type: 'expense' })
    })

    it('keeps primed items on an empty FIRST emission (sync not landed yet)', () => {
      const store = useTrnsStore()
      store.initTrns()
      const emit = h.watchCallbacks[0]!

      store.setTrns({ a: expense() })
      emit([])
      expect(store.items?.a).toBeDefined()
    })

    it('applies an empty later emission (genuine wipe)', () => {
      const store = useTrnsStore()
      store.initTrns()
      const emit = h.watchCallbacks[0]!

      emit([expenseRow('a', 1)])
      expect(store.items?.a).toBeDefined()

      emit([])
      expect(store.items).toBeNull()
    })

    it('does not subscribe in demo mode', () => {
      h.demo.value = true
      useTrnsStore().initTrns()
      expect(h.watchTable).not.toHaveBeenCalled()
    })

    it('flips isLoaded on the first emission and resets it on re-subscribe', () => {
      const store = useTrnsStore()
      expect(store.isLoaded).toBe(false)

      store.initTrns()
      expect(store.isLoaded).toBe(false) // armed but no emission yet

      h.watchCallbacks[0]!([]) // even an empty emission counts as hydrated
      expect(store.isLoaded).toBe(true)

      store.initTrns() // re-subscribe (e.g. a different user) waits again
      expect(store.isLoaded).toBe(false)
    })
  })

  describe('saveTrn', () => {
    it('applies the optimistic update synchronously and upserts the row', async () => {
      const store = useTrnsStore()
      store.saveTrn({ id: 't1', values: expense() })

      expect(store.items?.t1).toMatchObject({ categoryId: 'food', fromAmount: 100 })
      expect(store.items?.t1?.updatedAt).toEqual(expect.any(Number))

      await tick()
      expect(h.upsertRow).toHaveBeenCalledWith('transactions', 't1', expect.objectContaining({ from_amount: 100, user_id: 'u1' }))
    })

    it('rolls back to the previous items and toasts when the write fails', async () => {
      const store = useTrnsStore()
      const prev = store.items // null on a fresh store
      h.upsertRow.mockReset().mockRejectedValueOnce(new Error('boom'))

      store.saveTrn({ id: 't1', values: expense() })
      expect(store.items?.t1).toBeDefined() // optimistic write landed first

      await tick()
      expect(store.items).toBe(prev) // restored to the exact previous reference
      expect(toastAddMock).toHaveBeenCalledTimes(1)
    })

    it('does not touch PowerSync in demo mode', async () => {
      h.demo.value = true
      const store = useTrnsStore()
      store.saveTrn({ id: 't1', values: expense() })

      expect(store.items?.t1).toBeDefined()
      await tick()
      expect(h.upsertRow).not.toHaveBeenCalled()
    })

    it('stamps the persisted uid when the reactive session uid has not resolved', async () => {
      // Offline cold start: getSession resolved to null (reactive uid null), but the
      // session is still in localStorage. The row must carry the real uid, not '' (which
      // RLS would reject on upload, dropping the offline write).
      h.auth.uid.value = null
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: { id: 'persisted-uid' } }))

      const store = useTrnsStore()
      store.saveTrn({ id: 't1', values: expense() })

      await tick()
      expect(h.upsertRow).toHaveBeenCalledWith('transactions', 't1', expect.objectContaining({ user_id: 'persisted-uid' }))
    })
  })

  describe('saveTrns', () => {
    it('updates the store once and writes the complete batch atomically', async () => {
      const store = useTrnsStore()
      store.setTrns({ a: expense(), b: expense() })

      const result = await store.saveTrns({
        a: expense({ description: 'Shared', updatedAt: 99 }),
        b: expense({ date: 1700006400000, updatedAt: 99 }),
      })

      expect(result).toBe(true)
      expect(store.items?.a).toMatchObject({ description: 'Shared', updatedAt: 99 })
      expect(store.items?.b).toMatchObject({ date: 1700006400000, updatedAt: 99 })
      expect(h.upsertRows).toHaveBeenCalledTimes(1)
      expect(h.upsertRows).toHaveBeenCalledWith('transactions', [
        expect.objectContaining({ id: 'a', row: expect.objectContaining({ description: 'Shared', user_id: 'u1' }) }),
        expect.objectContaining({ id: 'b', row: expect.objectContaining({ date: 1700006400000, user_id: 'u1' }) }),
      ])
    })

    it('keeps createdAt of an edited trn and takes the createdAt of a new one', async () => {
      const store = useTrnsStore()
      store.setTrns({ a: expense({ createdAt: 5 }) })

      await store.saveTrns({ a: expense({ createdAt: 7, description: 'Edited' }), b: expense({ createdAt: 9 }) })

      expect(store.items?.a?.createdAt).toBe(5)
      expect(store.items?.b?.createdAt).toBe(9)
    })

    it('restores the whole batch when the write fails', async () => {
      const store = useTrnsStore()
      const initial = { a: expense(), b: expense() }
      store.setTrns(initial)
      const prev = store.items
      h.upsertRows.mockRejectedValueOnce(new Error('boom'))

      const result = await store.saveTrns({ a: expense({ description: 'Changed', updatedAt: 99 }) })

      expect(result).toBe(false)
      expect(store.items).toBe(prev)
      expect(toastAddMock).toHaveBeenCalledTimes(1)
    })

    it('does not touch PowerSync in demo mode', async () => {
      h.demo.value = true
      const store = useTrnsStore()

      expect(await store.saveTrns({ a: expense({ description: 'Demo', updatedAt: 99 }) })).toBe(true)
      expect(store.items?.a?.description).toBe('Demo')
      expect(h.upsertRows).not.toHaveBeenCalled()
    })
  })

  describe('deleteTrn', () => {
    it('removes the trn optimistically and deletes the row', async () => {
      const store = useTrnsStore()
      store.setTrns({ t1: expense(), t2: expense() })

      store.deleteTrn('t1')
      expect(store.items?.t1).toBeUndefined()
      expect(store.items?.t2).toBeDefined()

      await tick()
      expect(h.deleteRow).toHaveBeenCalledWith('transactions', 't1')
    })

    it('restores the deleted trn and toasts when the write fails', async () => {
      const store = useTrnsStore()
      const seeded = { t1: expense() }
      store.setTrns(seeded)
      const prev = store.items
      h.deleteRow.mockReset().mockRejectedValueOnce(new Error('boom'))

      store.deleteTrn('t1')
      expect(store.items?.t1).toBeUndefined() // optimistic removal

      await tick()
      expect(store.items).toBe(prev)
      expect(store.items?.t1).toBeDefined()
      expect(toastAddMock).toHaveBeenCalledTimes(1)
    })

    it('does not touch PowerSync in demo mode', async () => {
      h.demo.value = true
      const store = useTrnsStore()
      store.setTrns({ t1: expense() })

      store.deleteTrn('t1')
      await tick()
      expect(h.deleteRow).not.toHaveBeenCalled()
    })

    it('deletes a batch atomically and ignores duplicate or missing ids', async () => {
      const store = useTrnsStore()
      store.setTrns({ t1: expense(), t2: expense(), t3: expense() })

      const deleted = await store.deleteTrns(['t1', 't2', 't1', 'missing'])

      expect(deleted).toBe(true)
      expect(Object.keys(store.items ?? {})).toEqual(['t3'])
      expect(h.deleteRows).toHaveBeenCalledWith('transactions', ['t1', 't2'])
    })

    it('restores the complete batch when deletion fails', async () => {
      const store = useTrnsStore()
      const seeded = { t1: expense(), t2: expense() }
      store.setTrns(seeded)
      const prev = store.items
      h.deleteRows.mockRejectedValueOnce(new Error('boom'))

      const deleted = await store.deleteTrns(['t1', 't2'])

      expect(deleted).toBe(false)
      expect(store.items).toBe(prev)
      expect(toastAddMock).toHaveBeenCalledTimes(1)
    })

    it('deletes a batch locally without PowerSync in demo mode', async () => {
      h.demo.value = true
      const store = useTrnsStore()
      store.setTrns({ t1: expense(), t2: expense() })

      expect(await store.deleteTrns(['t1', 't2'])).toBe(true)
      expect(store.items).toEqual({})
      expect(h.deleteRows).not.toHaveBeenCalled()
    })
  })
})

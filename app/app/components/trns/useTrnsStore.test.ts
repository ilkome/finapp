import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { TrnItem } from '~/components/trns/types'

import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { toastAddMock } from '~/test-utils/setup-store'

// Mock the PowerSync data layer so the store talks to a controllable fake:
// `watchTable` captures its callback (to drive hydration), the mutations record
// calls and let us force rejections (to test optimistic rollback), `useDemo`
// flips real/demo mode, and `useSupabaseAuth` supplies a stable uid.
const h = vi.hoisted(() => {
  const watchCallbacks: ((rows: any[]) => void)[] = []
  return {
    auth: { session: { value: null }, signOut: vi.fn(), uid: { value: 'u1' }, user: { value: null } },
    deleteRow: vi.fn(),
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
vi.mock('~~/services/powersync/mutations', () => ({ deleteRow: h.deleteRow, upsertRow: h.upsertRow, upsertRows: h.upsertRows }))
vi.mock('~/components/demo/useDemo', () => ({ useDemo: () => ({ isDemo: h.demo }) }))
vi.mock('~/composables/useSupabase', () => ({ useSupabase: () => ({}), useSupabaseAuth: () => h.auth }))

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0))

function expense(over: Partial<TrnItem> = {}): TrnItem {
  return { amount: 100, categoryId: 'food', date: 1700000000000, type: TrnType.Expense, updatedAt: 1, walletId: 'cash', ...over } as TrnItem
}

function expenseRow(id: string, updatedAt: number, amount = 100) {
  return { amount, categoryId: 'food', date: 1700000000000, id, type: 0, updatedAt, walletId: 'cash' }
}

describe('useTrnsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    h.demo.value = false
    h.watchCallbacks.length = 0
    h.watchTable.mockClear()
    h.upsertRow.mockReset().mockResolvedValue(undefined)
    h.deleteRow.mockReset().mockResolvedValue(undefined)
    toastAddMock.mockClear()
  })

  describe('hydration via watch', () => {
    it('subscribes to the trns table and builds items from row snapshots', () => {
      const store = useTrnsStore()
      store.initTrns()

      expect(h.watchTable).toHaveBeenCalledTimes(1)
      expect(h.watchTable.mock.calls[0]?.[0]).toBe('SELECT * FROM trns')

      const emit = h.watchCallbacks[0]!
      emit([expenseRow('a', 1), expenseRow('b', 2)])

      expect(Object.keys(store.items ?? {})).toEqual(['a', 'b'])
      expect(store.items?.a).toMatchObject({ amount: 100, categoryId: 'food', type: 0 })
    })

    it('keeps primed items on an empty FIRST emission (sync not landed yet)', () => {
      const store = useTrnsStore()
      store.initTrns()
      const emit = h.watchCallbacks[0]!

      store.setTrns({ a: { amount: 100, categoryId: 'food', date: 1, type: 0 } } as never)
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

      expect(store.items?.t1).toMatchObject({ amount: 100, categoryId: 'food' })
      expect(store.items?.t1?.updatedAt).toEqual(expect.any(Number))

      await tick()
      expect(h.upsertRow).toHaveBeenCalledWith('trns', 't1', expect.objectContaining({ amount: 100, userId: 'u1' }))
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
  })

  describe('deleteTrn', () => {
    it('removes the trn optimistically and deletes the row', async () => {
      const store = useTrnsStore()
      store.setTrns({ t1: expense(), t2: expense() })

      store.deleteTrn('t1')
      expect(store.items?.t1).toBeUndefined()
      expect(store.items?.t2).toBeDefined()

      await tick()
      expect(h.deleteRow).toHaveBeenCalledWith('trns', 't1')
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
  })
})

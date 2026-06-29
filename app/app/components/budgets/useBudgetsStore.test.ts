import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { budgetAssignmentToRow, budgetToRow } from '~~/services/powersync/transforms'

import type { BudgetItem } from '~/components/budgets/types'

import { useBudgetsStore } from '~/components/budgets/useBudgetsStore'
import { toastAddMock } from '~/test-utils/setup-store'

const h = vi.hoisted(() => {
  const watchCallbacks: ((rows: any[]) => void)[] = []
  return {
    auth: { session: { value: null }, signOut: vi.fn(), uid: { value: 'u1' }, user: { value: null } },
    deleteRow: vi.fn(),
    demo: { value: false },
    upsertRow: vi.fn(),
    watchCallbacks,
    watchTable: vi.fn((_sql: string, _params: unknown[], cb: (rows: any[]) => void) => {
      watchCallbacks.push(cb)
      return { abort: vi.fn() }
    }),
  }
})

vi.mock('~~/services/powersync/db', () => ({ watchTable: h.watchTable }))
vi.mock('~~/services/powersync/mutations', () => ({ deleteRow: h.deleteRow, upsertRow: h.upsertRow }))
vi.mock('~/components/demo/useDemo', () => ({ useDemo: () => ({ isDemo: h.demo }) }))
vi.mock('~/composables/useSupabase', () => ({ useSupabase: () => ({}), useSupabaseAuth: () => h.auth }))

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0))

function budget(over: Partial<BudgetItem> = {}): BudgetItem {
  return { amount: 1000, amountPeriod: 'month', categoryId: 'food', currency: 'USD', kind: 'expense', rollover: 'none', status: 'active', updatedAt: 1, ...over }
}

describe('useBudgetsStore', () => {
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
    it('subscribes to both tables and maps row snapshots', () => {
      const store = useBudgetsStore()
      store.initBudgets()

      expect(h.watchTable).toHaveBeenCalledTimes(2)
      expect(h.watchTable.mock.calls[0]?.[0]).toBe('SELECT * FROM budgets')
      expect(h.watchTable.mock.calls[1]?.[0]).toBe('SELECT * FROM budget_assignments')

      h.watchCallbacks[0]!([{ id: 'b1', ...budgetToRow(budget(), 'u1') }])
      expect(store.items?.b1).toMatchObject({ categoryId: 'food', kind: 'expense', status: 'active' })
      expect(store.isLoaded).toBe(true)

      h.watchCallbacks[1]!([{ id: 'a1', ...budgetAssignmentToRow({ assigned: 500, budgetId: 'b1', periodStart: 100, updatedAt: 1 }, 'u1') }])
      expect(store.assignmentFor('b1', 100)).toBe(500)
    })
  })

  describe('setAssignment / clearAssignment', () => {
    it('writes a per-period override that assignmentFor reflects', async () => {
      const store = useBudgetsStore()
      store.setAssignment('b1', 100, 500)
      expect(store.assignmentFor('b1', 100)).toBe(500)

      await tick()
      expect(h.upsertRow).toHaveBeenCalledWith(
        'budget_assignments',
        expect.any(String),
        expect.objectContaining({ assigned: 500, budgetId: 'b1', periodStart: 100, userId: 'u1' }),
      )
    })

    it('replaces the override for the same period in place (single row)', () => {
      const store = useBudgetsStore()
      store.setAssignment('b1', 100, 500)
      store.setAssignment('b1', 100, 800)

      expect(store.assignmentFor('b1', 100)).toBe(800)
      expect(Object.keys(store.assignments ?? {})).toHaveLength(1)
    })

    it('keeps overrides for the same budget across different periods separate', () => {
      const store = useBudgetsStore()
      store.setAssignment('b1', 100, 500)
      store.setAssignment('b1', 200, 700)

      expect(store.assignmentFor('b1', 100)).toBe(500)
      expect(store.assignmentFor('b1', 200)).toBe(700)
      expect(Object.keys(store.assignments ?? {})).toHaveLength(2)
    })

    it('clears the override so the normalized default applies again', async () => {
      const store = useBudgetsStore()
      store.setAssignment('b1', 100, 500)
      const id = Object.keys(store.assignments ?? {})[0]!
      h.deleteRow.mockClear()

      store.clearAssignment('b1', 100)
      expect(store.assignmentFor('b1', 100)).toBeUndefined()

      await tick()
      expect(h.deleteRow).toHaveBeenCalledWith('budget_assignments', id)
    })

    it('clearAssignment is a no-op when no override exists', () => {
      const store = useBudgetsStore()
      store.clearAssignment('b1', 100)
      expect(h.deleteRow).not.toHaveBeenCalled()
    })

    it('rolls back and toasts when the write fails', async () => {
      const store = useBudgetsStore()
      const prev = store.assignments
      h.upsertRow.mockReset().mockRejectedValueOnce(new Error('boom'))

      store.setAssignment('b1', 100, 500)
      expect(store.assignmentFor('b1', 100)).toBe(500)

      await tick()
      expect(store.assignments).toBe(prev)
      expect(store.assignmentFor('b1', 100)).toBeUndefined()
      expect(toastAddMock).toHaveBeenCalledTimes(1)
    })

    it('does not touch PowerSync in demo mode', async () => {
      h.demo.value = true
      const store = useBudgetsStore()
      store.setAssignment('b1', 100, 500)
      expect(store.assignmentFor('b1', 100)).toBe(500)

      await tick()
      expect(h.upsertRow).not.toHaveBeenCalled()
    })
  })

  describe('archiveBudget', () => {
    it('flips status to archived and persists it', async () => {
      const store = useBudgetsStore()
      store.saveBudget(budget(), 'b1')
      h.upsertRow.mockClear()

      store.archiveBudget('b1')
      expect(store.items?.b1?.status).toBe('archived')

      await tick()
      expect(h.upsertRow).toHaveBeenCalledWith('budgets', 'b1', expect.objectContaining({ status: 'archived', userId: 'u1' }))
    })

    it('drops archived budgets from activeItems', () => {
      const store = useBudgetsStore()
      store.saveBudget(budget(), 'a')
      store.saveBudget(budget({ categoryId: 'fun', status: 'archived' }), 'b')

      expect(Object.keys(store.activeItems)).toEqual(['a'])
    })
  })

  describe('unarchiveBudget', () => {
    it('restores when no active budget occupies the category+kind slot', () => {
      const store = useBudgetsStore()
      store.saveBudget(budget({ status: 'archived' }), 'b1')

      expect(store.unarchiveBudget('b1')).toEqual({ ok: true })
      expect(store.items?.b1?.status).toBe('active')
    })

    it('refuses and returns the conflicting id when an active budget covers the same category+kind', () => {
      const store = useBudgetsStore()
      store.saveBudget(budget({ categoryId: 'food', kind: 'expense', status: 'active' }), 'active1')
      store.saveBudget(budget({ categoryId: 'food', kind: 'expense', status: 'archived' }), 'arch1')

      expect(store.unarchiveBudget('arch1')).toEqual({ conflictId: 'active1', ok: false })
      expect(store.items?.arch1?.status).toBe('archived')
    })

    it('allows restoring when the only same-category budget is a different kind', () => {
      const store = useBudgetsStore()
      store.saveBudget(budget({ categoryId: 'food', kind: 'income', status: 'active' }), 'inc1')
      store.saveBudget(budget({ categoryId: 'food', kind: 'expense', status: 'archived' }), 'arch1')

      expect(store.unarchiveBudget('arch1')).toEqual({ ok: true })
      expect(store.items?.arch1?.status).toBe('active')
    })

    it('ignores another archived budget on the same category', () => {
      const store = useBudgetsStore()
      store.saveBudget(budget({ categoryId: 'food', status: 'archived' }), 'arch1')
      store.saveBudget(budget({ categoryId: 'food', status: 'archived' }), 'arch2')

      expect(store.unarchiveBudget('arch1')).toEqual({ ok: true })
    })

    it('returns not-ok for an unknown budget', () => {
      const store = useBudgetsStore()
      expect(store.unarchiveBudget('nope')).toEqual({ ok: false })
    })
  })
})

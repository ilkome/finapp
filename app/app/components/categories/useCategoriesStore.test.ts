import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Categories, CategoryItem } from '~/components/categories/types'
import type { TrnItem } from '~/components/trns/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { toastAddMock } from '~/test-utils/setup-store'

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

function category(over: Partial<CategoryItem> = {}): CategoryItem {
  return { color: '#111', icon: 'mdi:cat', name: 'Food', parentId: 0, showInLastUsed: true, showInQuickSelector: false, ...over }
}

// The store re-adds the synthetic transfer/adjustment entries on every
// setCategories, so seeding with a partial map (cast to Categories) is faithful.
function cats(map: Record<string, CategoryItem>): Categories {
  return map as Categories
}

function categoryRow(id: string, over: Record<string, unknown> = {}) {
  return { color: '#111', icon: 'mdi:cat', id, name: id, parentId: null, showInLastUsed: 1, showInQuickSelector: 0, updatedAt: 1, ...over }
}

function expense(over: Partial<TrnItem> = {}): TrnItem {
  return { amount: 100, categoryId: 'c1', date: 1700000000000, type: TrnType.Expense, updatedAt: 1, walletId: 'w1', ...over } as TrnItem
}

describe('useCategoriesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    h.demo.value = false
    h.watchCallbacks.length = 0
    h.watchTable.mockClear()
    h.upsertRow.mockReset().mockResolvedValue(undefined)
    h.upsertRows.mockReset().mockResolvedValue(undefined)
    h.deleteRow.mockReset().mockResolvedValue(undefined)
    toastAddMock.mockClear()
  })

  describe('hydration via watch', () => {
    it('keeps the synthetic adjustment/transfer entries and tracks hasItems', () => {
      const store = useCategoriesStore()
      expect(store.hasItems).toBe(false) // only synthetic entries present
      expect(store.items.adjustment).toBeDefined()
      expect(store.items.transfer).toBeDefined()

      store.initCategories()
      expect(h.watchTable.mock.calls[0]?.[0]).toBe('SELECT * FROM categories')

      h.watchCallbacks[0]!([categoryRow('c1'), categoryRow('c2')])
      expect(store.hasItems).toBe(true)
      expect(store.items.c1).toMatchObject({ icon: 'mdi:cat' })
      expect(store.items.adjustment).toBeDefined() // synthetic re-added

      h.watchCallbacks[0]!([])
      expect(store.hasItems).toBe(false)
      expect(store.items.transfer).toBeDefined()
    })

    it('flips isLoaded on the first emission and resets it on re-subscribe', () => {
      const store = useCategoriesStore()
      expect(store.isLoaded).toBe(false)

      store.initCategories()
      expect(store.isLoaded).toBe(false) // armed but no emission yet

      h.watchCallbacks[0]!([]) // even an empty emission counts as hydrated
      expect(store.isLoaded).toBe(true)

      store.initCategories() // re-subscribe (e.g. a different user) waits again
      expect(store.isLoaded).toBe(false)
    })
  })

  describe('saveCategory', () => {
    it('updates optimistically and upserts the touched row', async () => {
      const store = useCategoriesStore()
      store.setCategories(cats({ c1: category() }))

      await store.saveCategory({ id: 'c1', isUpdateChildCategoriesColor: false, values: category({ name: 'Renamed' }) })

      expect(store.items.c1).toMatchObject({ name: 'Renamed' })
      expect(h.upsertRows).toHaveBeenCalledWith('categories', expect.arrayContaining([
        expect.objectContaining({ id: 'c1', row: expect.objectContaining({ name: 'Renamed', userId: 'u1' }) }),
      ]))
    })

    it('propagates color to kept children and upserts each touched row', async () => {
      const store = useCategoriesStore()
      store.setCategories(cats({ c1: category({ color: '#aaa' }), c2: category({ color: '#bbb', parentId: 'c1' }) }))

      await store.saveCategory({ id: 'c1', isUpdateChildCategoriesColor: true, values: category({ color: '#fff' }) })

      expect(store.items.c1?.color).toBe('#fff')
      expect(store.items.c2?.color).toBe('#fff') // propagated to child
      const upsertedIds = h.upsertRows.mock.calls[0]![1].map((r: { id: string }) => r.id)
      expect(upsertedIds).toEqual(expect.arrayContaining(['c1', 'c2']))
    })

    it('rolls back and toasts when the write fails', async () => {
      const store = useCategoriesStore()
      store.setCategories(cats({ c1: category() }))
      const prev = store.items
      h.upsertRows.mockReset().mockRejectedValueOnce(new Error('boom'))

      await store.saveCategory({ id: 'c1', isUpdateChildCategoriesColor: false, values: category({ name: 'Renamed' }) })

      // setCategories always re-wraps with the synthetic entries, so the rollback
      // restores content (not the exact reference).
      expect(store.items).toEqual(prev)
      expect(store.items.c1?.name).toBe('Food')
      expect(toastAddMock).toHaveBeenCalledTimes(1)
    })

    it('is a no-op for the synthetic transfer/adjustment ids', async () => {
      const store = useCategoriesStore()
      store.setCategories(cats({ c1: category() }))

      await store.saveCategory({ id: 'transfer', isUpdateChildCategoriesColor: false, values: category() })
      await store.saveCategory({ id: 'adjustment', isUpdateChildCategoriesColor: false, values: category() })

      expect(h.upsertRows).not.toHaveBeenCalled()
    })

    it('does not touch PowerSync in demo mode', async () => {
      h.demo.value = true
      const store = useCategoriesStore()
      store.setCategories(cats({ c1: category() }))

      await store.saveCategory({ id: 'c1', isUpdateChildCategoriesColor: false, values: category({ name: 'X' }) })
      expect(store.items.c1?.name).toBe('X')
      expect(h.upsertRows).not.toHaveBeenCalled()
    })
  })

  describe('deleteCategory', () => {
    it('cascades: removes the category and its trns, deleting both in the DB', async () => {
      const trnsStore = useTrnsStore()
      trnsStore.setTrns({ t1: expense(), t2: expense({ categoryId: 'c2' }) })
      const store = useCategoriesStore()
      store.setCategories(cats({ c1: category() }))

      await store.deleteCategory('c1', ['t1'])

      expect(store.items.c1).toBeUndefined()
      expect(trnsStore.items?.t1).toBeUndefined()
      expect(trnsStore.items?.t2).toBeDefined()
      expect(h.deleteRow).toHaveBeenCalledWith('categories', 'c1')
      expect(h.deleteRow).toHaveBeenCalledWith('trns', 't1')
    })

    it('restores the category and cascaded trns when the write fails', async () => {
      const trnsStore = useTrnsStore()
      const seededTrns = { t1: expense() }
      trnsStore.setTrns(seededTrns)
      const store = useCategoriesStore()
      store.setCategories(cats({ c1: category() }))
      const prev = store.items
      h.deleteRow.mockReset().mockRejectedValueOnce(new Error('boom'))

      await store.deleteCategory('c1', ['t1'])

      expect(store.items).toEqual(prev) // re-wrapped with synthetic entries
      expect(store.items.c1).toBeDefined()
      expect(trnsStore.items).toBe(seededTrns)
      expect(toastAddMock).toHaveBeenCalledTimes(1)
    })

    it('is a no-op for the synthetic adjustment id', async () => {
      const store = useCategoriesStore()
      store.setCategories(cats({ c1: category() }))

      await store.deleteCategory('adjustment')
      expect(h.deleteRow).not.toHaveBeenCalled()
    })
  })

  describe('children-map (hasChildren / getChildrenIds)', () => {
    it('returns a root\'s children, sorted by name', () => {
      const store = useCategoriesStore()
      store.setCategories(cats({
        c1: category({ name: 'Root' }),
        c2: category({ name: 'Banana', parentId: 'c1' }),
        c3: category({ name: 'Apple', parentId: 'c1' }),
      }))

      expect(store.hasChildren('c1')).toBe(true)
      expect(store.getChildrenIds('c1')).toEqual(['c3', 'c2']) // Apple before Banana
    })

    it('reports no children for a leaf, a childless root, or an unknown id', () => {
      const store = useCategoriesStore()
      store.setCategories(cats({
        c1: category({ name: 'Root' }),
        c2: category({ name: 'Child', parentId: 'c1' }),
        c9: category({ name: 'Lonely' }),
      }))

      expect(store.hasChildren('c2')).toBe(false) // a child is never a parent (parentId !== 0 guard)
      expect(store.getChildrenIds('c2')).toEqual([])
      expect(store.hasChildren('c9')).toBe(false) // root with no children
      expect(store.hasChildren('nope')).toBe(false)
      expect(store.getChildrenIds('nope')).toEqual([])
    })

    it('never treats synthetic transfer/adjustment as children', () => {
      const store = useCategoriesStore()
      store.setCategories(cats({ c1: category(), c2: category({ parentId: 'c1' }) }))

      // synthetic entries have parentId 0, so they group under no real parent
      expect(store.getChildrenIds('transfer')).toEqual([])
      expect(store.getChildrenIds('adjustment')).toEqual([])
      expect(store.getChildrenIds('c1')).not.toContain('transfer')
      expect(store.getChildrenIds('c1')).not.toContain('adjustment')
    })

    it('recomputes when a child is added or removed', () => {
      const store = useCategoriesStore()
      store.setCategories(cats({ c1: category({ name: 'Root' }) }))
      expect(store.hasChildren('c1')).toBe(false)

      store.setCategories(cats({
        c1: category({ name: 'Root' }),
        c2: category({ name: 'Child', parentId: 'c1' }),
      }))
      expect(store.hasChildren('c1')).toBe(true)
      expect(store.getChildrenIds('c1')).toEqual(['c2'])

      store.setCategories(cats({ c1: category({ name: 'Root' }) }))
      expect(store.hasChildren('c1')).toBe(false)
      expect(store.getChildrenIds('c1')).toEqual([])
    })

    it('returns a fresh array that callers cannot mutate', () => {
      const store = useCategoriesStore()
      store.setCategories(cats({ c1: category(), c2: category({ parentId: 'c1' }) }))

      const first = store.getChildrenIds('c1')
      first.push('mutated')
      expect(store.getChildrenIds('c1')).toEqual(['c2']) // cache untouched
    })
  })
})

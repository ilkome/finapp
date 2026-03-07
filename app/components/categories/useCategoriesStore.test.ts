import localforage from 'localforage'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CategoryItem } from '~/components/categories/types'

// --- Entity-specific mocks ---

vi.mock('~~/services/convex/api', () => ({
  convexCategoriesToMap: (v: any) => v,
}))

vi.mock('~/components/categories/utils', () => ({
  compareCategoriesByParentAndName: () => 0,
  getTransactibleCategoriesIds: () => [],
}))

const mutationMock = vi.fn(() => Promise.resolve())
const onUpdateMock = vi.fn()

vi.stubGlobal('useConvexClientWithApi', () => ({
  api: {
    categories: { create: 'categories.create', list: 'categories.list', remove: 'categories.remove', update: 'categories.update', updateWithChildren: 'categories.updateWithChildren' },
  },
  client: {
    mutation: mutationMock,
    onUpdate: onUpdateMock,
  },
}))

const removeTrnsFromStoreMock = vi.fn()
const deleteTrnsByIdsMock = vi.fn()
vi.mock('~/components/trns/useTrnsStore', () => ({
  useTrnsStore: () => ({
    deleteTrnsByIds: deleteTrnsByIdsMock,
    hasItems: false,
    items: {},
    removeTrnsFromStore: removeTrnsFromStoreMock,
  }),
}))

const offlineHelpers = await import('~/components/offline/helpers')
vi.mock('~/components/offline/helpers', async (importOriginal) => {
  const actual = await importOriginal() as any
  return {
    clearOfflineQueue: vi.fn(actual.clearOfflineQueue),
    getAllOfflineOps: vi.fn(actual.getAllOfflineOps),
    getOfflineOpsByEntity: vi.fn(actual.getOfflineOpsByEntity),
    pushOfflineOp: vi.fn(actual.pushOfflineOp),
    removeOfflineOp: vi.fn(actual.removeOfflineOp),
    removeOfflineOpByType: vi.fn(actual.removeOfflineOpByType),
  }
})

const { useCategoriesStore } = await import('~/components/categories/useCategoriesStore')

// --- Helpers ---

function makeCategory(overrides: Partial<CategoryItem> = {}): CategoryItem {
  return {
    color: '#f00',
    icon: 'mdi:food',
    name: 'Food',
    parentId: 0,
    showInLastUsed: true,
    showInQuickSelector: false,
    ...overrides,
  }
}

// --- Tests ---

describe('useCategoriesStore', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    await localforage.clear()
    vi.clearAllMocks()
    mutationMock.mockReturnValue(Promise.resolve())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('saveCategory — optimistic UI', () => {
    it('updates items immediately', () => {
      const store = useCategoriesStore()

      store.saveCategory({
        id: 'c1',
        isUpdateChildCategoriesColor: false,
        values: makeCategory(),
      })

      expect(store.items).toHaveProperty('c1')
      expect(store.items.c1.name).toBe('Food')
    })

    it('saves to localforage', async () => {
      const store = useCategoriesStore()

      store.saveCategory({
        id: 'c1',
        isUpdateChildCategoriesColor: false,
        values: makeCategory(),
      })

      const saved = await localforage.getItem<any>('finapp.categories')
      expect(saved).toHaveProperty('c1')
    })

    it('pushes to offline queue immediately', () => {
      const store = useCategoriesStore()

      store.saveCategory({
        id: 'c1',
        isUpdateChildCategoriesColor: false,
        values: makeCategory(),
      })

      expect(offlineHelpers.pushOfflineOp).toHaveBeenCalledWith(
        expect.objectContaining({ entity: 'categories', id: 'c1', type: 'create' }),
      )
    })

    it('fires Convex create mutation for new category', () => {
      const store = useCategoriesStore()

      store.saveCategory({
        id: 'c1',
        isUpdateChildCategoriesColor: false,
        values: makeCategory(),
      })

      expect(mutationMock).toHaveBeenCalledWith(
        'categories.create',
        expect.objectContaining({ color: '#f00', name: 'Food' }),
      )
    })

    it('fires Convex update mutation for existing category', () => {
      const store = useCategoriesStore()
      store.items = { ...store.items, c1: makeCategory() }

      store.saveCategory({
        id: 'c1',
        isUpdateChildCategoriesColor: false,
        values: makeCategory({ name: 'Food & Drinks' }),
      })

      expect(mutationMock).toHaveBeenCalledWith(
        'categories.update',
        expect.objectContaining({ id: 'c1', name: 'Food & Drinks' }),
      )
    })

    it('cleans up offline queue on mutation success', async () => {
      const store = useCategoriesStore()

      store.saveCategory({
        id: 'c1',
        isUpdateChildCategoriesColor: false,
        values: makeCategory(),
      })

      await vi.waitFor(() => {
        expect(offlineHelpers.removeOfflineOp).toHaveBeenCalledWith('categories', 'c1')
      })
    })

    it('skips transfer category', () => {
      const store = useCategoriesStore()

      store.saveCategory({
        id: 'transfer',
        isUpdateChildCategoriesColor: false,
        values: makeCategory({ name: 'Transfer' }),
      })

      expect(mutationMock).not.toHaveBeenCalled()
      expect(offlineHelpers.pushOfflineOp).not.toHaveBeenCalled()
    })

    it('updates child colors when isUpdateChildCategoriesColor is true', () => {
      const store = useCategoriesStore()
      store.items = {
        ...store.items,
        child1: makeCategory({ color: '#f00', name: 'Child 1', parentId: 'parent1' }),
        child2: makeCategory({ color: '#f00', name: 'Child 2', parentId: 'parent1' }),
        parent1: makeCategory({ childIds: ['child1', 'child2'], color: '#f00', name: 'Parent' }),
      }

      store.saveCategory({
        id: 'parent1',
        isUpdateChildCategoriesColor: true,
        values: makeCategory({ childIds: ['child1', 'child2'], color: '#00f', name: 'Parent' }),
      })

      expect(store.items.child1.color).toBe('#00f')
      expect(store.items.child2.color).toBe('#00f')
      expect(store.items.parent1.color).toBe('#00f')
    })

    it('fires updateWithChildren mutation when updating children color', () => {
      const store = useCategoriesStore()
      store.items = {
        ...store.items,
        child1: makeCategory({ color: '#f00', name: 'Child 1', parentId: 'parent1' }),
        parent1: makeCategory({ childIds: ['child1'], color: '#f00', name: 'Parent' }),
      }

      store.saveCategory({
        id: 'parent1',
        isUpdateChildCategoriesColor: true,
        values: makeCategory({ color: '#00f', name: 'Parent' }),
      })

      expect(mutationMock).toHaveBeenCalledWith(
        'categories.updateWithChildren',
        expect.objectContaining({ childIds: ['child1'], color: '#00f', id: 'parent1' }),
      )
    })

    it('syncs childIds when parentId changes', () => {
      const store = useCategoriesStore()
      store.items = {
        ...store.items,
        c1: makeCategory({ name: 'Child', parentId: 'oldParent' }),
        newParent: makeCategory({ name: 'New Parent' }),
        oldParent: makeCategory({ childIds: ['c1'], name: 'Old Parent' }),
      }

      store.saveCategory({
        id: 'c1',
        isUpdateChildCategoriesColor: false,
        values: makeCategory({ name: 'Child', parentId: 'newParent' }),
      })

      expect(store.items.oldParent.childIds).toBeUndefined()
      expect(store.items.newParent.childIds).toEqual(['c1'])
    })

    it('shows toast on mutation failure', async () => {
      const { toastAddMock } = await import('~/test-utils/setup-store')
      mutationMock.mockReturnValue(Promise.reject(new Error('Server error')))
      const store = useCategoriesStore()

      store.saveCategory({
        id: 'c1',
        isUpdateChildCategoriesColor: false,
        values: makeCategory(),
      })

      await vi.waitFor(() => {
        expect(toastAddMock).toHaveBeenCalledWith(
          expect.objectContaining({ color: 'error' }),
        )
      })
    })
  })

  describe('deleteCategory — optimistic UI', () => {
    it('removes item from store immediately', () => {
      const store = useCategoriesStore()
      store.items = { ...store.items, c1: makeCategory(), c2: makeCategory({ name: 'Transport' }) }

      store.deleteCategory('c1')

      expect(store.items).not.toHaveProperty('c1')
      expect(store.items).toHaveProperty('c2')
      // transfer should always remain
      expect(store.items).toHaveProperty('transfer')
    })

    it('pushes to offline queue', () => {
      const store = useCategoriesStore()
      store.items = { ...store.items, c1: makeCategory() }

      store.deleteCategory('c1')

      expect(offlineHelpers.pushOfflineOp).toHaveBeenCalledWith(
        expect.objectContaining({ entity: 'categories', id: 'c1', type: 'delete' }),
      )
    })

    it('only pushes category delete op (backend cascades trns)', () => {
      const store = useCategoriesStore()
      store.items = { ...store.items, c1: makeCategory() }

      store.deleteCategory('c1', ['trn1', 'trn2'])

      // Only category delete op — no explicit trns delete ops
      expect(offlineHelpers.pushOfflineOp).toHaveBeenCalledTimes(1)
      expect(offlineHelpers.pushOfflineOp).toHaveBeenCalledWith(
        expect.objectContaining({ entity: 'categories', id: 'c1', type: 'delete' }),
      )
    })

    it('removes trns from store immediately (optimistic)', () => {
      const store = useCategoriesStore()
      store.items = { ...store.items, c1: makeCategory() }

      store.deleteCategory('c1', ['trn1', 'trn2'])

      expect(removeTrnsFromStoreMock).toHaveBeenCalledWith(['trn1', 'trn2'])
    })

    it('fires Convex remove mutation', () => {
      const store = useCategoriesStore()
      store.items = { ...store.items, c1: makeCategory() }

      store.deleteCategory('c1')

      expect(mutationMock).toHaveBeenCalledWith('categories.remove', { id: 'c1' })
    })

    it('cleans up offline queue on mutation success', async () => {
      const store = useCategoriesStore()
      store.items = { ...store.items, c1: makeCategory() }

      store.deleteCategory('c1')

      await vi.waitFor(() => {
        expect(offlineHelpers.removeOfflineOp).toHaveBeenCalledWith('categories', 'c1')
      })
    })

    it('skips transfer category', () => {
      const store = useCategoriesStore()

      store.deleteCategory('transfer')

      expect(mutationMock).not.toHaveBeenCalled()
      expect(offlineHelpers.pushOfflineOp).not.toHaveBeenCalled()
    })

    it('shows toast on delete mutation failure', async () => {
      const { toastAddMock } = await import('~/test-utils/setup-store')
      mutationMock.mockReturnValue(Promise.reject(new Error('Server error')))
      const store = useCategoriesStore()
      store.items = { ...store.items, c1: makeCategory() }

      store.deleteCategory('c1')

      await vi.waitFor(() => {
        expect(toastAddMock).toHaveBeenCalledWith(
          expect.objectContaining({ color: 'error' }),
        )
      })
    })

    it('syncs parent childIds on delete', () => {
      const store = useCategoriesStore()
      store.items = {
        ...store.items,
        c1: makeCategory({ name: 'Child', parentId: 'parent1' }),
        parent1: makeCategory({ childIds: ['c1', 'c2'], name: 'Parent' }),
      }

      store.deleteCategory('c1')

      expect(store.items.parent1.childIds).toEqual(['c2'])
    })
  })
})

import localforage from 'localforage'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CategoryItem } from '~/components/categories/types'

vi.mock('~~/services/convex/api', () => ({
  convexCategoriesToMap: (v: any) => v,
}))

vi.mock('~/components/categories/utils', () => ({
  compareCategoriesByParentAndName: () => 0,
  compareCategoryIds: () => 0,
  computeChildrenDiff: (prev: string[], next: string[]) => {
    const prevSet = new Set(prev)
    const nextSet = new Set(next)
    return {
      added: next.filter(id => !prevSet.has(id)),
      removed: prev.filter(id => !nextSet.has(id)),
    }
  },
  getTransactibleCategoriesIds: () => [],
}))

const mutationMock = vi.fn<(path: string, args?: unknown) => Promise<unknown>>(() => Promise.resolve(undefined))
const actionMock = vi.fn<(path: string, args?: unknown) => Promise<unknown>>(() => Promise.resolve(undefined))
const onUpdateMock = vi.fn()

vi.stubGlobal('useConvexClientWithApi', () => ({
  api: {
    categories: { create: 'categories.create', list: 'categories.list', remove: 'categories.remove', setChildren: 'categories.setChildren', update: 'categories.update', updateWithChildren: 'categories.updateWithChildren' },
  },
  client: {
    action: actionMock,
    mutation: mutationMock,
    onUpdate: onUpdateMock,
  },
}))

const removeTrnsFromStoreMock = vi.fn()
vi.mock('~/components/trns/useTrnsStore', () => ({
  useTrnsStore: () => ({
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
    removeOfflineOps: vi.fn(actual.removeOfflineOps),
    updateOfflineOpData: vi.fn(actual.updateOfflineOpData),
  }
})

const { useCategoriesStore } = await import('~/components/categories/useCategoriesStore')

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

describe('useCategoriesStore', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    await localforage.clear()
    vi.clearAllMocks()
    mutationMock.mockReturnValue(Promise.resolve())
    actionMock.mockReturnValue(Promise.resolve())
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
      expect(store.items.c1!.name).toBe('Food')
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
        parent1: makeCategory({ color: '#f00', name: 'Parent' }),
      }

      store.saveCategory({
        id: 'parent1',
        isUpdateChildCategoriesColor: true,
        values: makeCategory({ color: '#00f', name: 'Parent' }),
      })

      expect(store.items.child1!.color).toBe('#00f')
      expect(store.items.child2!.color).toBe('#00f')
      expect(store.items.parent1!.color).toBe('#00f')
    })

    it('fires updateWithChildren mutation when updating children color', () => {
      const store = useCategoriesStore()
      store.items = {
        ...store.items,
        child1: makeCategory({ color: '#f00', name: 'Child 1', parentId: 'parent1' }),
        parent1: makeCategory({ color: '#f00', name: 'Parent' }),
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

    it('computes children correctly after parentId change', () => {
      const store = useCategoriesStore()
      store.items = {
        ...store.items,
        c1: makeCategory({ name: 'Child', parentId: 'oldParent' }),
        newParent: makeCategory({ name: 'New Parent' }),
        oldParent: makeCategory({ name: 'Old Parent' }),
      }

      store.saveCategory({
        id: 'c1',
        isUpdateChildCategoriesColor: false,
        values: makeCategory({ name: 'Child', parentId: 'newParent' }),
      })

      expect(store.getChildrenIds('oldParent')).toEqual([])
      expect(store.getChildrenIds('newParent')).toEqual(['c1'])
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

  describe('saveCategory — create new parent with children', () => {
    it('remaps children parentId from local to convex id after create resolves', async () => {
      const store = useCategoriesStore()
      store.items = {
        ...store.items,
        child1: makeCategory({ name: 'Child 1', parentId: 'oldRoot' }),
        child2: makeCategory({ name: 'Child 2' }),
        oldRoot: makeCategory({ name: 'Old Root' }),
      }

      mutationMock.mockImplementation((path: string) => {
        if (path === 'categories.create')
          return Promise.resolve('convex_new')
        return Promise.resolve()
      })

      store.saveCategory({
        id: 'local_xyz',
        isUpdateChildCategoriesColor: false,
        nextChildIds: ['child1', 'child2'],
        values: makeCategory({ name: 'New Parent' }),
      })

      expect(store.items.child1!.parentId).toBe('local_xyz')
      expect(store.items.child2!.parentId).toBe('local_xyz')

      await vi.waitFor(() => {
        expect(store.items.child1!.parentId).toBe('convex_new')
        expect(store.items.child2!.parentId).toBe('convex_new')
      })
    })

    it('calls setChildren with convex parent id after create resolves', async () => {
      const store = useCategoriesStore()
      store.items = {
        ...store.items,
        child1: makeCategory({ name: 'Child 1' }),
      }

      mutationMock.mockImplementation((path: string) => {
        if (path === 'categories.create')
          return Promise.resolve('convex_new')
        return Promise.resolve()
      })

      store.saveCategory({
        id: 'local_xyz',
        isUpdateChildCategoriesColor: false,
        nextChildIds: ['child1'],
        values: makeCategory({ name: 'New Parent' }),
      })

      await vi.waitFor(() => {
        expect(mutationMock).toHaveBeenCalledWith(
          'categories.setChildren',
          expect.objectContaining({
            addIds: ['child1'],
            id: 'convex_new',
            removeIds: [],
          }),
        )
      })
    })

    it('filters local-id children from setChildren addIds', async () => {
      const store = useCategoriesStore()
      store.items = {
        ...store.items,
        child1: makeCategory({ name: 'Child 1' }),
        local_child: makeCategory({ name: 'Local Child' }),
      }

      mutationMock.mockImplementation((path: string) => {
        if (path === 'categories.create')
          return Promise.resolve('convex_new')
        return Promise.resolve()
      })

      store.saveCategory({
        id: 'local_parent',
        isUpdateChildCategoriesColor: false,
        nextChildIds: ['child1', 'local_child'],
        values: makeCategory({ name: 'New Parent' }),
      })

      await vi.waitFor(() => {
        expect(mutationMock).toHaveBeenCalledWith(
          'categories.setChildren',
          expect.objectContaining({ addIds: ['child1'] }),
        )
      })
    })

    it('passes childrenColor when isUpdateChildCategoriesColor is true', async () => {
      const store = useCategoriesStore()
      store.items = {
        ...store.items,
        child1: makeCategory({ color: '#f00', name: 'Child 1' }),
      }

      mutationMock.mockImplementation((path: string) => {
        if (path === 'categories.create')
          return Promise.resolve('convex_new')
        return Promise.resolve()
      })

      store.saveCategory({
        id: 'local_xyz',
        isUpdateChildCategoriesColor: true,
        nextChildIds: ['child1'],
        values: makeCategory({ color: '#00f', name: 'New Parent' }),
      })

      await vi.waitFor(() => {
        expect(mutationMock).toHaveBeenCalledWith(
          'categories.setChildren',
          expect.objectContaining({ childrenColor: '#00f' }),
        )
      })
    })

    it('rolls back children parentId and color when setChildren fails', async () => {
      const store = useCategoriesStore()
      store.items = {
        ...store.items,
        child1: makeCategory({ color: '#aaa', name: 'Child 1', parentId: 'oldRoot' }),
        oldRoot: makeCategory({ name: 'Old Root' }),
      }

      mutationMock.mockImplementation((path: string) => {
        if (path === 'categories.create')
          return Promise.resolve('convex_new')
        if (path === 'categories.setChildren')
          return Promise.reject(new Error('Server error'))
        return Promise.resolve()
      })

      store.saveCategory({
        id: 'local_xyz',
        isUpdateChildCategoriesColor: true,
        nextChildIds: ['child1'],
        values: makeCategory({ color: '#00f', name: 'New Parent' }),
      })

      await vi.waitFor(() => {
        expect(store.items.child1!.parentId).toBe('oldRoot')
        expect(store.items.child1!.color).toBe('#aaa')
      })
    })

    it('skips setChildren when only local-id children selected', async () => {
      const store = useCategoriesStore()
      store.items = {
        ...store.items,
        local_child: makeCategory({ name: 'Local Child' }),
      }

      mutationMock.mockImplementation((path: string) => {
        if (path === 'categories.create')
          return Promise.resolve('convex_new')
        return Promise.resolve()
      })

      store.saveCategory({
        id: 'local_parent',
        isUpdateChildCategoriesColor: false,
        nextChildIds: ['local_child'],
        values: makeCategory({ name: 'New Parent' }),
      })

      await vi.waitFor(() => {
        expect(mutationMock).toHaveBeenCalledWith('categories.create', expect.anything())
      })
      // Allow potential setChildren microtask to flush
      await Promise.resolve()
      expect(mutationMock).not.toHaveBeenCalledWith('categories.setChildren', expect.anything())
    })
  })

  describe('saveCategory — optimistic updatedAt', () => {
    it('stamps updatedAt on the saved category', () => {
      const before = Date.now()
      const store = useCategoriesStore()

      store.saveCategory({
        id: 'c1',
        isUpdateChildCategoriesColor: false,
        values: makeCategory(),
      })

      const after = Date.now()
      const updatedAt = store.items.c1!.updatedAt
      expect(updatedAt).toBeTypeOf('number')
      expect(updatedAt!).toBeGreaterThanOrEqual(before)
      expect(updatedAt!).toBeLessThanOrEqual(after)
    })

    it('stamps updatedAt on color-propagated children', () => {
      const store = useCategoriesStore()
      store.items = {
        ...store.items,
        child1: makeCategory({ color: '#f00', name: 'Child 1', parentId: 'parent1', updatedAt: 1 }),
        parent1: makeCategory({ color: '#f00', name: 'Parent', updatedAt: 1 }),
      }

      store.saveCategory({
        id: 'parent1',
        isUpdateChildCategoriesColor: true,
        values: makeCategory({ color: '#00f', name: 'Parent' }),
      })

      expect(store.items.child1!.updatedAt!).toBeGreaterThan(1)
    })

    it('stamps updatedAt on reparented children', () => {
      const store = useCategoriesStore()
      store.items = {
        ...store.items,
        child1: makeCategory({ name: 'Child 1', parentId: 0, updatedAt: 1 }),
        parent1: makeCategory({ name: 'Parent', updatedAt: 1 }),
      }

      store.saveCategory({
        id: 'parent1',
        isUpdateChildCategoriesColor: false,
        nextChildIds: ['child1'],
        values: makeCategory({ name: 'Parent' }),
      })

      expect(store.items.child1!.parentId).toBe('parent1')
      expect(store.items.child1!.updatedAt!).toBeGreaterThan(1)
    })

    it('applyRealtimePatch ignores stale doc with older updatedAt after in-flight clears', async () => {
      const store = useCategoriesStore()
      store.items = {
        ...store.items,
        c1: makeCategory({ name: 'Optimistic Name', updatedAt: 5000 }),
      }

      // Skip in-flight protection: only updatedAt comparison is in play.
      store.applyRealtimePatch({
        deletedIds: [],
        docs: [{
          _creationTime: 0,
          _id: 'c1',
          color: '#f00',
          icon: 'mdi:food',
          name: 'Stale Server Name',
          parentId: 0,
          showInLastUsed: true,
          showInQuickSelector: false,
          updatedAt: 4000,
          userId: 'u1',
        }],
        serverTime: Date.now(),
        truncated: false,
      })

      expect(store.items.c1!.name).toBe('Optimistic Name')
    })
  })

  describe('saveCategory — offline queue corrections (Phase 3)', () => {
    it('3b: patches queued child update op parentId after parent remap', async () => {
      const store = useCategoriesStore()
      store.items = { ...store.items, child1: makeCategory({ name: 'Child 1' }) }

      mutationMock.mockImplementation((path: string) => {
        if (path === 'categories.create')
          return Promise.resolve('convex_p1')
        return Promise.resolve()
      })

      store.saveCategory({
        id: 'local_p1',
        isUpdateChildCategoriesColor: false,
        nextChildIds: ['child1'],
        values: makeCategory({ name: 'New Parent' }),
      })

      await vi.waitFor(() => {
        expect(offlineHelpers.updateOfflineOpData).toHaveBeenCalledWith(
          'categories',
          'child1',
          { parentId: 'convex_p1' },
        )
      })
    })

    it('3c: queues per-kept-child color op for offline survival', () => {
      const store = useCategoriesStore()
      store.items = {
        ...store.items,
        child1: makeCategory({ color: '#f00', name: 'Child 1', parentId: 'parent1' }),
        parent1: makeCategory({ color: '#f00', name: 'Parent' }),
      }

      store.saveCategory({
        id: 'parent1',
        isUpdateChildCategoriesColor: true,
        values: makeCategory({ color: '#00f', name: 'Parent' }),
      })

      expect(offlineHelpers.pushOfflineOp).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ color: '#00f' }),
          entity: 'categories',
          id: 'child1',
          type: 'update',
        }),
      )
    })

    it('3d: setChildren rollback drains per-child reparent ops (existing parent)', async () => {
      const store = useCategoriesStore()
      store.items = {
        ...store.items,
        child1: makeCategory({ name: 'Child 1', parentId: 0 }),
        parent1: makeCategory({ name: 'Parent' }),
      }

      mutationMock.mockImplementation((path: string) => {
        if (path === 'categories.setChildren')
          return Promise.reject(new Error('Server error'))
        return Promise.resolve()
      })

      store.saveCategory({
        id: 'parent1',
        isUpdateChildCategoriesColor: false,
        nextChildIds: ['child1'],
        values: makeCategory({ name: 'Parent' }),
      })

      await vi.waitFor(() => {
        expect(offlineHelpers.removeOfflineOps).toHaveBeenCalledWith(
          'categories',
          expect.arrayContaining(['child1']),
        )
      })
      expect(store.items.child1!.parentId).toBe(0)
    })

    it('3b/3d: existing-parent setChildren filters local-id children out of server call', async () => {
      const store = useCategoriesStore()
      store.items = {
        ...store.items,
        local_child: makeCategory({ name: 'Local Child', parentId: 0 }),
        parent1: makeCategory({ name: 'Parent' }),
        server_child: makeCategory({ name: 'Server Child', parentId: 0 }),
      }

      store.saveCategory({
        id: 'parent1',
        isUpdateChildCategoriesColor: false,
        nextChildIds: ['server_child', 'local_child'],
        values: makeCategory({ name: 'Parent' }),
      })

      await vi.waitFor(() => {
        expect(mutationMock).toHaveBeenCalledWith(
          'categories.setChildren',
          expect.objectContaining({ addIds: ['server_child'] }),
        )
      })
    })

    it('3d: existing-parent setChildren rollback patches local-child queued op parentId', async () => {
      const store = useCategoriesStore()
      store.items = {
        ...store.items,
        local_child: makeCategory({ name: 'Local Child', parentId: 0 }),
        parent1: makeCategory({ name: 'Parent' }),
        server_child: makeCategory({ name: 'Server Child', parentId: 0 }),
      }

      mutationMock.mockImplementation((path: string) => {
        if (path === 'categories.setChildren')
          return Promise.reject(new Error('Server error'))
        return Promise.resolve()
      })

      store.saveCategory({
        id: 'parent1',
        isUpdateChildCategoriesColor: false,
        nextChildIds: ['server_child', 'local_child'],
        values: makeCategory({ name: 'Parent' }),
      })

      await vi.waitFor(() => {
        expect(offlineHelpers.updateOfflineOpData).toHaveBeenCalledWith(
          'categories',
          'local_child',
          { parentId: 0 },
        )
      })
      const removeCalls = (offlineHelpers.removeOfflineOps as any).mock.calls
      const flatRemoved = removeCalls.flatMap((c: any[]) => c[1])
      expect(flatRemoved).not.toContain('local_child')
    })

    it('3d: setChildren rollback in new-parent branch drains non-local + patches local children', async () => {
      const store = useCategoriesStore()
      store.items = {
        ...store.items,
        child1: makeCategory({ name: 'Child 1', parentId: 0 }),
        local_child2: makeCategory({ name: 'Local Child', parentId: 0 }),
      }

      mutationMock.mockImplementation((path: string) => {
        if (path === 'categories.create')
          return Promise.resolve('convex_p1')
        if (path === 'categories.setChildren')
          return Promise.reject(new Error('Server error'))
        return Promise.resolve()
      })

      store.saveCategory({
        id: 'local_p1',
        isUpdateChildCategoriesColor: false,
        nextChildIds: ['child1', 'local_child2'],
        values: makeCategory({ name: 'New Parent' }),
      })

      await vi.waitFor(() => {
        expect(offlineHelpers.removeOfflineOps).toHaveBeenCalledWith(
          'categories',
          expect.arrayContaining(['child1']),
        )
      })
      // Non-local child purged, local child kept (its create op stays — patched to prev parentId).
      const removeCalls = (offlineHelpers.removeOfflineOps as any).mock.calls
      const flatRemoved = removeCalls.flatMap((c: any[]) => c[1])
      expect(flatRemoved).not.toContain('local_child2')
      expect(offlineHelpers.updateOfflineOpData).toHaveBeenCalledWith(
        'categories',
        'local_child2',
        { parentId: 0 },
      )
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

      expect(actionMock).toHaveBeenCalledWith('categories.remove', { id: 'c1' })
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

      expect(actionMock).not.toHaveBeenCalled()
      expect(offlineHelpers.pushOfflineOp).not.toHaveBeenCalled()
    })

    it('shows toast on failure', async () => {
      const { toastAddMock } = await import('~/test-utils/setup-store')
      actionMock.mockReturnValue(Promise.reject(new Error('Server error')))
      const store = useCategoriesStore()
      store.items = { ...store.items, c1: makeCategory() }

      store.deleteCategory('c1')

      await vi.waitFor(() => {
        expect(toastAddMock).toHaveBeenCalledWith(
          expect.objectContaining({ color: 'error' }),
        )
      })
    })

    it('parent has no deleted child in getChildrenIds', () => {
      const store = useCategoriesStore()
      store.items = {
        ...store.items,
        c1: makeCategory({ name: 'Child 1', parentId: 'parent1' }),
        c2: makeCategory({ name: 'Child 2', parentId: 'parent1' }),
        parent1: makeCategory({ name: 'Parent' }),
      }

      store.deleteCategory('c1')

      expect(store.getChildrenIds('parent1')).toEqual(['c2'])
    })
  })
})

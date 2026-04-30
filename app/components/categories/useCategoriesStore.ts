import { convexCategoriesToMap } from '~~/services/convex/api'

import type { AddCategoryParams, Categories, CategoryId, CategoryItem } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'
import type { RemapInfo } from '~/composables/useStoreSync'

import { compareCategoryIds, computeChildrenDiff, getTransactibleCategoriesIds } from '~/components/categories/utils'
import { useDemo } from '~/components/demo/useDemo'
import { removeOfflineOps, updateOfflineOpData } from '~/components/offline/helpers'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { createDebouncedPersist, handleMutationResult, isInFlight, mergeOfflineOps, pushDeleteOp, pushSaveOp } from '~/composables/useStoreSync'
import { createLogger } from '~/utils/logger'

const adjustment: CategoryItem = {
  color: '',
  icon: 'mdi:plus-minus',
  name: 'Adjustment',
  parentId: 0,
  showInLastUsed: false,
  showInQuickSelector: false,
}

const transfer: CategoryItem = {
  color: '',
  icon: 'mdi:repeat',
  name: 'Transfer',
  parentId: 0,
  showInLastUsed: false,
  showInQuickSelector: false,
}

type CategoriesStore = {
  applyRealtimePatch: (patch: { deletedIds: string[], docs: { [k: string]: unknown, _creationTime: number, _id: string, userId: string }[], serverTime: number, truncated: boolean }) => number | null
  categoriesForBeParent: ComputedRef<CategoryId[]>
  categoriesIdsForTrnValues: ComputedRef<CategoryId[]>
  categoriesRootIds: ComputedRef<CategoryId[]>
  deleteCategory: (id: CategoryId, trnsIds?: TrnId[]) => Promise<RemapInfo | void> | void
  favoriteCategoriesIds: ComputedRef<CategoryId[]>
  getChildrenIds: (categoryId: CategoryId) => CategoryId[]
  getChildrenIdsOrParent: (categoryId: CategoryId) => CategoryId[]
  getTransactibleIds: (ids?: CategoryId[]) => CategoryId[]
  hasChildren: (categoryId: CategoryId) => boolean
  hasItems: ComputedRef<boolean>
  initCategories: () => void
  isTransactible: (categoryId: CategoryId) => boolean
  items: import('vue').ShallowRef<Categories>
  lastSyncedAt: import('vue').Ref<number>
  recentCategoriesIds: ComputedRef<CategoryId[]>
  saveCategory: (params: AddCategoryParams) => Promise<RemapInfo | void> | void
  setCategories: (values: Categories | null) => void
}

const logger = createLogger('categories')

export const useCategoriesStore = defineStore('categories', (): CategoriesStore => {
  const trnsStore = useTrnsStore()
  const { isDemo } = useDemo()

  const items = shallowRef<Categories>({ adjustment, transfer })
  const hasItems = computed(() =>
    Object.keys(items.value).some(id => id !== 'transfer' && id !== 'adjustment'),
  )

  const categoriesIds = computed(() => Object.keys(items.value))

  const categoriesRootIds = computed(() => {
    if (!hasItems.value)
      return []

    return categoriesIds.value
      .filter(id => items.value[id]?.parentId === 0 && id !== 'transfer' && id !== 'adjustment')
      .sort((a, b) => compareCategoryIds(a, b, items.value))
  })

  const usedCategoryIds = computed(() => {
    const ids = new Set<string>()
    const trns = trnsStore.items
    if (trns) {
      for (const id in trns) {
        const trn = trns[id]
        if (trn)
          ids.add(trn.categoryId)
      }
    }
    return ids
  })

  const categoriesForBeParent = computed(() => {
    if (!hasItems.value)
      return []

    return categoriesRootIds.value.filter((id: CategoryId) =>
      !usedCategoryIds.value.has(id) && id !== 'transfer',
    )
  })

  const transactibleIds = computed(() => getTransactibleCategoriesIds(items.value))
  const transactibleIdsSet = computed(() => new Set(transactibleIds.value))

  const favoriteCategoriesIds = computed(() => {
    if (!hasItems.value)
      return []

    return categoriesIds.value
      .filter(id => items.value[id]?.showInQuickSelector)
      .sort((a, b) => compareCategoryIds(a, b, items.value))
  })

  const recentCategoriesIds = computed(() => {
    if (!hasItems.value || !trnsStore.hasItems)
      return []

    const trnsItems = trnsStore.items
    const maxCategories = Math.min(categoriesIds.value.length, 16)
    const favoriteIds = new Set(favoriteCategoriesIds.value)

    // Track most recent date per category (single pass)
    const latestDateByCategory = new Map<CategoryId, number>()
    for (const trnId in trnsItems) {
      const trn = trnsItems[trnId]
      if (!trn || trn.type === TrnType.Transfer || trn.categoryId === 'adjustment')
        continue

      const categoryId = trn.categoryId
      const existing = latestDateByCategory.get(categoryId)
      if (!existing || trn.date > existing)
        latestDateByCategory.set(categoryId, trn.date)
    }

    const sortedEntries = [...latestDateByCategory.entries()].toSorted(([, dateA], [, dateB]) => dateB - dateA)

    const recentIds: CategoryId[] = []
    for (const [categoryId] of sortedEntries) {
      if (recentIds.length >= maxCategories)
        break

      const category = items.value[categoryId]
      if (!category || !category.showInLastUsed || categoryId === 'transfer' || favoriteIds.has(categoryId))
        continue

      recentIds.push(categoryId)
    }

    return recentIds
      .sort((a, b) => compareCategoryIds(a, b, items.value))
  })

  const categoriesIdsForTrnValues = computed<CategoryId[]>(() =>
    transactibleIds.value.filter(id => id !== 'transfer'),
  )

  const debouncedPersist = createDebouncedPersist<Categories>(STORAGE_KEYS.categories)

  const lastSyncedAt = ref(0)

  async function initCategories() {
    try {
      const { api, client } = useConvexClientWithApi()
      const categories = await client.query(api.categories.list, {})
      let data: Categories | null = categories?.length ? convexCategoriesToMap(categories) : null

      if (data)
        data = await mergeOfflineOps(data, 'categories') as Categories

      setCategories(data)
      lastSyncedAt.value = Date.now()
    }
    catch (e) {
      logger.error('init failed', e)
    }
  }

  type ConvexCategoryDoc = { [key: string]: unknown, _creationTime: number, _id: string, userId: string }

  function applyRealtimePatch(patch: { deletedIds: string[], docs: ConvexCategoryDoc[], serverTime: number, truncated: boolean }): number | null {
    if (patch.truncated) {
      logger.log('realtime delta truncated — running initCategories')
      initCategories()
      return null
    }

    const current = items.value
    const updated: Categories = { ...current }
    let changed = false

    for (const doc of patch.docs) {
      if (isInFlight(doc._id))
        continue
      const existing = updated[doc._id]
      const existingUpdatedAt = existing?.updatedAt
      const docUpdatedAt = typeof doc.updatedAt === 'number' ? doc.updatedAt : 0
      if (existing && typeof existingUpdatedAt === 'number' && existingUpdatedAt >= docUpdatedAt)
        continue
      const { _creationTime: _ct, _id, userId: _u, ...rest } = doc
      updated[_id] = rest as unknown as CategoryItem
      changed = true
    }

    for (const id of patch.deletedIds) {
      if (isInFlight(id) || id === 'transfer' || id === 'adjustment')
        continue
      if (id in updated) {
        delete updated[id]
        changed = true
      }
    }

    if (changed) {
      // setCategories re-adds synthetic transfer/adjustment entries.
      const userItems: Record<CategoryId, CategoryItem> = {}
      for (const id of Object.keys(updated)) {
        if (id !== 'transfer' && id !== 'adjustment')
          userItems[id] = updated[id]!
      }
      setCategories(userItems as Categories)
      logger.log(`realtime: ${patch.docs.length} docs, ${patch.deletedIds.length} deletes`)
    }
    lastSyncedAt.value = patch.serverTime
    return patch.serverTime
  }

  function setCategories(values: Categories | null) {
    const categories = values ? { ...values, adjustment, transfer } : { adjustment, transfer }
    items.value = categories
    debouncedPersist(categories)
  }

  function hasChildren(categoryId: CategoryId) {
    if (!hasItems.value)
      return false

    const category = items.value[categoryId]
    if (!category || category.parentId !== 0)
      return false

    return Object.keys(items.value).some(id => items.value[id]?.parentId === categoryId)
  }

  function getChildrenIds(categoryId: CategoryId) {
    if (!hasItems.value)
      return []

    return Object.keys(items.value)
      .filter(id => items.value[id]?.parentId === categoryId)
      .sort((a, b) => compareCategoryIds(a, b, items.value))
  }

  function getChildrenIdsOrParent(categoryId: CategoryId) {
    const children = getChildrenIds(categoryId)
    return children.length ? children : [categoryId]
  }

  function getTransactibleIds(ids?: CategoryId[]) {
    return getTransactibleCategoriesIds(items.value, ids)
  }

  function isTransactible(categoryId: CategoryId) {
    return transactibleIdsSet.value.has(categoryId)
  }

  function applyOptimisticUpdate(
    id: CategoryId,
    categoryValues: CategoryItem,
    isUpdateChildCategoriesColor: boolean,
    colorPropagationIds: CategoryId[],
    reparent?: { added: CategoryId[], removed: CategoryId[] },
  ) {
    const now = Date.now()
    const updatedItems: Categories = {
      ...items.value,
      [id]: { ...categoryValues, updatedAt: now },
    }

    if (isUpdateChildCategoriesColor && colorPropagationIds.length > 0) {
      for (const childId of colorPropagationIds) {
        if (updatedItems[childId])
          updatedItems[childId] = { ...updatedItems[childId], color: categoryValues.color, updatedAt: now }
      }
    }

    if (reparent) {
      for (const addId of reparent.added) {
        const existing = updatedItems[addId]
        if (!existing)
          continue
        updatedItems[addId] = {
          ...existing,
          color: isUpdateChildCategoriesColor ? categoryValues.color : existing.color,
          parentId: id,
          updatedAt: now,
        }
      }
      for (const removeId of reparent.removed) {
        if (updatedItems[removeId])
          updatedItems[removeId] = { ...updatedItems[removeId], parentId: 0, updatedAt: now }
      }
    }

    setCategories(updatedItems)
  }

  function saveCategory({ id, isUpdateChildCategoriesColor, nextChildIds, values }: AddCategoryParams) {
    if (id === 'transfer' || id === 'adjustment')
      return

    const prevChildIds = getChildrenIds(id)
    const useChildrenDiff = Array.isArray(nextChildIds)
    const diff = useChildrenDiff
      ? computeChildrenDiff(prevChildIds, nextChildIds!)
      : { added: [] as CategoryId[], removed: [] as CategoryId[] }
    const hasChildrenDiff = diff.added.length > 0 || diff.removed.length > 0
    // Children that stay under this parent — safe color propagation targets
    const keptChildIds = useChildrenDiff
      ? prevChildIds.filter(cid => nextChildIds!.includes(cid))
      : prevChildIds

    // Frontend IDs are always treated as new creates (server generates real ID)
    const isExisting = !isLocalId(id) && items.value && id in items.value

    // Capture pre-optimistic snapshot for rollback (only for reparented children)
    const reparentRollback = new Map<CategoryId, { color: string, parentId: CategoryId | 0 }>()
    if (hasChildrenDiff) {
      for (const cid of [...diff.added, ...diff.removed]) {
        const prev = items.value[cid]
        if (prev)
          reparentRollback.set(cid, { color: prev.color, parentId: prev.parentId })
      }
    }

    applyOptimisticUpdate(
      id,
      values,
      isUpdateChildCategoriesColor,
      keptChildIds,
      hasChildrenDiff ? diff : undefined,
    )

    if (!pushSaveOp({ entity: 'categories', id, isDemo: !!isDemo.value, isExisting: !!isExisting, values }))
      return

    // 3c — Queue per-kept-child color ops so propagation survives updateWithChildren failure.
    const useUpdateWithChildren = !!isExisting && isUpdateChildCategoriesColor && keptChildIds.length > 0
    if (useUpdateWithChildren) {
      const snapshot = items.value
      for (const cid of keptChildIds) {
        const child = snapshot[cid]
        if (!child)
          continue
        pushSaveOp({
          entity: 'categories',
          id: cid,
          isDemo: !!isDemo.value,
          isExisting: true,
          values: { ...child, color: values.color } as unknown as Record<string, unknown>,
        })
      }
    }

    const { api, client } = useConvexClientWithApi()
    const action = isExisting ? 'update' : 'create'

    const categoryData = {
      color: values.color,
      icon: values.icon,
      name: values.name,
      parentId: values.parentId ? asConvexId<'categories'>(String(values.parentId)) : 0 as const,
      showInLastUsed: values.showInLastUsed,
      showInQuickSelector: values.showInQuickSelector,
    }

    const mutation = useUpdateWithChildren
      ? client.mutation(api.categories.updateWithChildren, {
          childIds: keptChildIds.map(cid => asConvexId<'categories'>(cid)),
          id: asConvexId<'categories'>(id),
          ...categoryData,
        })
      : isExisting
        ? client.mutation(api.categories.update, { id: asConvexId<'categories'>(id), ...categoryData })
        : client.mutation(api.categories.create, categoryData)

    const coreResult = handleMutationResult({
      action,
      entity: 'categories',
      errorMessage: 'categories.errors.saveFailed',
      // When updateWithChildren is in play, drain kept-child ops on success too.
      id: useUpdateWithChildren ? [id, ...keptChildIds] : id,
      items,
      mutation,
    })

    if (hasChildrenDiff) {
      const snapshot = items.value
      const reparentIds: CategoryId[] = []
      for (const addId of diff.added) {
        const current = snapshot[addId]
        if (!current)
          continue
        reparentIds.push(addId)
        pushSaveOp({
          entity: 'categories',
          id: addId,
          isDemo: !!isDemo.value,
          isExisting: true,
          values: { ...current, parentId: id } as unknown as Record<string, unknown>,
        })
      }
      for (const removeId of diff.removed) {
        const current = snapshot[removeId]
        if (!current)
          continue
        reparentIds.push(removeId)
        pushSaveOp({
          entity: 'categories',
          id: removeId,
          isDemo: !!isDemo.value,
          isExisting: true,
          values: { ...current, parentId: 0 } as unknown as Record<string, unknown>,
        })
      }

      if (reparentIds.length > 0 && !isLocalId(id)) {
        // Filter local-id children out of setChildren — their create op carries
        // the new parentId via the collapsed update op, so server picks it up
        // when the create eventually replays. Sending local_* to setChildren
        // would be rejected as an invalid Convex id.
        const serverAddIds = diff.added.filter(cid => !isLocalId(cid))
        const serverRemoveIds = diff.removed.filter(cid => !isLocalId(cid))

        if (serverAddIds.length === 0 && serverRemoveIds.length === 0)
          return coreResult

        const reparentMutation = client.mutation(api.categories.setChildren, {
          addIds: serverAddIds.map(cid => asConvexId<'categories'>(cid)),
          childrenColor: isUpdateChildCategoriesColor ? values.color : undefined,
          id: asConvexId<'categories'>(id),
          removeIds: serverRemoveIds.map(cid => asConvexId<'categories'>(cid)),
        })
        handleMutationResult({
          action: 'update',
          entity: 'categories',
          errorMessage: 'categories.errors.saveFailed',
          id: [...serverAddIds, ...serverRemoveIds],
          items,
          mutation: reparentMutation,
          onError: () => {
            // Restore previous parentIds/colors for reparented categories
            const restored: Categories = { ...items.value }
            for (const [cid, prev] of reparentRollback) {
              if (restored[cid])
                restored[cid] = { ...restored[cid], color: prev.color, parentId: prev.parentId }
            }
            setCategories(restored)
            // 3d — Drain non-local reparent update ops; for local-id children
            // patch their queued create back to pre-optimistic parentId so the
            // child is still created server-side, just under the original parent.
            const nonLocalIds = reparentIds.filter(cid => !isLocalId(cid))
            if (nonLocalIds.length > 0)
              void removeOfflineOps('categories', nonLocalIds)
            for (const cid of reparentIds) {
              if (!isLocalId(cid))
                continue
              const prev = reparentRollback.get(cid)
              if (prev)
                void updateOfflineOpData('categories', cid, { parentId: prev.parentId })
            }
          },
        })
      }
      else if (reparentIds.length > 0 && isLocalId(id)) {
        // New parent: wait for create to remap localId → convexId, then
        // patch children's parentId locally and call setChildren on server.
        // Local-id children stay queued and rely on offline replay.
        const serverAddIds = diff.added.filter(cid => !isLocalId(cid))
        const serverRemoveIds = diff.removed.filter(cid => !isLocalId(cid))

        Promise.resolve(coreResult).then((remap) => {
          if (!remap || remap.localId !== id)
            return

          const updated: Categories = { ...items.value }
          let changed = false
          for (const addId of diff.added) {
            const child = updated[addId]
            if (child && child.parentId === remap.localId) {
              updated[addId] = { ...child, parentId: remap.convexId }
              changed = true
            }
          }
          if (changed)
            setCategories(updated)

          // 3b — Patch queued child ops so their data.parentId no longer points
          // at the remapped local id. Covers both reparented existing children
          // (queued as 'update') and local-id children with their own queued
          // 'create' op carrying values.parentId = local_parent_id.
          for (const addId of diff.added)
            void updateOfflineOpData('categories', addId, { parentId: remap.convexId })

          if (serverAddIds.length === 0 && serverRemoveIds.length === 0)
            return

          const reparentMutation = client.mutation(api.categories.setChildren, {
            addIds: serverAddIds.map(cid => asConvexId<'categories'>(cid)),
            childrenColor: isUpdateChildCategoriesColor ? values.color : undefined,
            id: asConvexId<'categories'>(remap.convexId),
            removeIds: serverRemoveIds.map(cid => asConvexId<'categories'>(cid)),
          })
          handleMutationResult({
            action: 'update',
            entity: 'categories',
            errorMessage: 'categories.errors.saveFailed',
            id: [...serverAddIds, ...serverRemoveIds],
            items,
            mutation: reparentMutation,
            onError: () => {
              const restored: Categories = { ...items.value }
              for (const [cid, prev] of reparentRollback) {
                if (restored[cid])
                  restored[cid] = { ...restored[cid], color: prev.color, parentId: prev.parentId }
              }
              setCategories(restored)
              // 3d — Drain non-local reparent update ops; for local-id children
              // patch their queued create back to pre-optimistic parentId.
              const nonLocalIds = [...diff.added, ...diff.removed].filter(cid => !isLocalId(cid))
              if (nonLocalIds.length > 0)
                void removeOfflineOps('categories', nonLocalIds)
              for (const cid of [...diff.added, ...diff.removed]) {
                if (!isLocalId(cid))
                  continue
                const prev = reparentRollback.get(cid)
                if (prev)
                  void updateOfflineOpData('categories', cid, { parentId: prev.parentId })
              }
            },
          })
        }).catch((e) => {
          // coreResult resolves with RemapInfo|void and never rejects (handleMutationResult
          // catches mutation rejection internally), but guard against unforeseen throws.
          logger.error('reparent post-create flow failed', e)
        })
      }
    }

    return coreResult
  }

  function deleteCategory(id: CategoryId, trnsIds?: TrnId[]) {
    if (id === 'transfer' || id === 'adjustment')
      return

    const categories = { ...items.value }
    delete categories[id]
    setCategories(categories)

    if (trnsIds?.length)
      trnsStore.removeTrnsFromStore(trnsIds)

    if (!pushDeleteOp({ entity: 'categories', id, isDemo: !!isDemo.value }))
      return

    const { api, client } = useConvexClientWithApi()
    return handleMutationResult({
      action: 'delete',
      entity: 'categories',
      errorMessage: 'categories.errors.deleteFailed',
      id,
      items,
      mutation: client.action(api.categories.remove, { id: asConvexId<'categories'>(id) }),

    })
  }

  return {
    applyRealtimePatch,
    categoriesForBeParent,
    categoriesIdsForTrnValues,
    categoriesRootIds,
    deleteCategory,
    favoriteCategoriesIds,
    getChildrenIds,
    getChildrenIdsOrParent,
    getTransactibleIds,
    hasChildren,
    hasItems,
    initCategories,
    isTransactible,
    items,
    lastSyncedAt,
    recentCategoriesIds,
    saveCategory,
    setCategories,
  }
})

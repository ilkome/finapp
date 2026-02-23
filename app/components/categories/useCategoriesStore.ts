import { convexCategoriesToMap } from '~~/services/convex/api'

import type { AddCategoryParams, Categories, CategoryId, CategoryItem } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'
import type { RemapInfo } from '~/composables/useStoreSync'

import { compareCategoriesByParentAndName, getTransactibleCategoriesIds, getTransferCategoriesIds } from '~/components/categories/utils'
import { useDemo } from '~/components/demo/useDemo'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { createDebouncedPersist, handleMutationResult, mergeOfflineOps, pushDeleteOp, pushSaveOp } from '~/composables/useStoreSync'
import { createLogger } from '~/utils/logger'

const adjustment: CategoryItem = {
  childIds: [],
  color: 'var(--text-4)',
  icon: 'mdi:plus-minus',
  name: 'Adjustment',
  parentId: 0,
  showInLastUsed: false,
  showInQuickSelector: false,
}

const transfer: CategoryItem = {
  childIds: [],
  color: 'var(--text-4)',
  icon: 'mdi:repeat',
  name: 'Transfer',
  parentId: 0,
  showInLastUsed: false,
  showInQuickSelector: false,
}

type CategoriesStore = {
  cancelPersist: () => void
  categoriesForBeParent: ComputedRef<CategoryId[]>
  categoriesIds: ComputedRef<CategoryId[]>
  categoriesIdsForTrnValues: ComputedRef<CategoryId[]>
  categoriesRootIds: ComputedRef<CategoryId[]>
  deleteCategory: (id: CategoryId, trnsIds?: TrnId[]) => Promise<RemapInfo | void> | void
  favoriteCategoriesIds: ComputedRef<CategoryId[]>
  getChildsIds: (categoryId: CategoryId) => CategoryId[]
  getChildsIdsOrParent: (categoryId: CategoryId) => CategoryId[]
  getTransactibleIds: (ids?: CategoryId[]) => CategoryId[]
  hasChildren: (categoryId: CategoryId) => boolean
  hasItems: ComputedRef<boolean>
  initCategories: () => void
  isItTransactible: (categoryId: CategoryId) => boolean
  items: ShallowRef<Categories>
  recentCategoriesIds: ComputedRef<CategoryId[]>
  saveCategory: (params: AddCategoryParams) => Promise<RemapInfo | void> | void
  setCategories: (values: Categories | null) => void
  transactibleIds: ComputedRef<CategoryId[]>
  transferCategoriesIds: ComputedRef<CategoryId[]>
}

const logger = createLogger('categories')

export const useCategoriesStore = defineStore('categories', (): CategoriesStore => {
  const trnsStore = useTrnsStore()
  const { isDemo } = useDemo()

  const items = shallowRef<Categories>({ adjustment, transfer })
  const hasItems = computed(() =>
    Object.keys(items.value).some(id => id !== 'transfer' && id !== 'adjustment'),
  )

  const transferCategoriesIds = computed(() => getTransferCategoriesIds(items.value))

  const categoriesIds = computed(() => {
    if (!items.value)
      return []

    return Object.keys(items.value)
  })

  const categoriesRootIds = computed(() => {
    if (!hasItems.value || !items.value)
      return []

    const transferIds = new Set(transferCategoriesIds.value)
    return Object.keys(items.value)
      .filter(id => items.value?.[id]?.parentId === 0 && !transferIds.has(id) && id !== 'adjustment')
      .sort((a, b) => compareCategoriesByParentAndName(items.value[a]!, items.value[b]!, items.value))
  })

  const categoriesForBeParent = computed(() => {
    if (!hasItems.value || !items.value)
      return []

    const usedCategoryIds = new Set(
      Object.values(trnsStore.items ?? {}).map(trn => trn.categoryId),
    )
    const transferIds = new Set(transferCategoriesIds.value)

    return categoriesRootIds.value.filter((id: CategoryId) =>
      !usedCategoryIds.has(id) && !transferIds.has(id),
    )
  })

  const transactibleIds = computed(() => getTransactibleCategoriesIds(items.value))
  const transactibleIdsSet = computed(() => new Set(transactibleIds.value))

  const favoriteCategoriesIds = computed(() => {
    if (!hasItems.value)
      return []

    return Object.keys(items.value)
      .filter(id => items.value[id]?.showInQuickSelector)
      .sort((a, b) => {
        const catA = items.value[a]!
        const catB = items.value[b]!
        const parentNameA = items.value[catA.parentId]?.name || ''
        const parentNameB = items.value[catB.parentId]?.name || ''

        if (parentNameA !== parentNameB)
          return parentNameA.localeCompare(parentNameB)

        return catA.name.localeCompare(catB.name)
      })
  })

  const recentCategoriesIds = computed(() => {
    if (!hasItems.value || !trnsStore.hasItems)
      return []

    const trnsItems = trnsStore.items
    const maxCategories = Math.min(categoriesIds.value.length, 16)
    const transferIds = new Set(transferCategoriesIds.value)
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

    // Filter valid categories and pick top N by most recent usage
    const recentIds = [...latestDateByCategory.entries()]
      .sort(([, dateA], [, dateB]) => dateB - dateA)
      .reduce<CategoryId[]>((acc, [categoryId]) => {
        if (acc.length >= maxCategories)
          return acc

        const category = items.value[categoryId]
        if (!category || !category.showInLastUsed || transferIds.has(categoryId) || favoriteIds.has(categoryId))
          return acc

        acc.push(categoryId)
        return acc
      }, [])

    return recentIds
      .sort((a, b) => compareCategoriesByParentAndName(items.value[a]!, items.value[b]!, items.value))
  })

  const categoriesIdsForTrnValues = computed<CategoryId[]>(() => {
    const transferIds = new Set(transferCategoriesIds.value)
    return categoriesIds.value.filter((id) => {
      if (transferIds.has(id))
        return false
      return !items.value[id]?.childIds?.length
    })
  })

  const debouncedPersist = createDebouncedPersist<Categories>(STORAGE_KEYS.categories)

  async function initCategories() {
    try {
      const { api, client } = useConvexClientWithApi()
      const categories = await client.query(api.categories.list, {})
      let data: Categories | null = categories?.length ? convexCategoriesToMap(categories) : null

      if (data)
        data = await mergeOfflineOps(data, 'categories')

      setCategories(data)
    }
    catch (e) {
      logger.error('init failed', e)
    }
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

    return !!category.childIds?.length
  }

  function getChildsIds(categoryId: CategoryId) {
    if (!hasItems.value)
      return []

    const category = items.value[categoryId]
    if (!category?.childIds?.length)
      return []

    return [...category.childIds]
      .sort((a, b) => compareCategoriesByParentAndName(items.value[a]!, items.value[b]!, items.value))
  }

  function getChildsIdsOrParent(categoryId: CategoryId) {
    if (!hasItems.value)
      return []

    const category = items.value[categoryId]
    return category?.childIds?.length
      ? [...category.childIds]
      : [categoryId]
  }

  function getTransactibleIds(ids?: CategoryId[]) {
    return getTransactibleCategoriesIds(items.value ?? {}, ids)
  }

  function isItTransactible(categoryId: CategoryId) {
    return transactibleIdsSet.value.has(categoryId)
  }

  function syncOptimisticParentChildIds(categories: Categories, id: CategoryId, oldParentId: CategoryId | 0, newParentId: CategoryId | 0) {
    if (oldParentId === newParentId)
      return

    if (oldParentId && oldParentId !== 0) {
      const pId = String(oldParentId)
      if (categories[pId]) {
        const filtered = (categories[pId].childIds ?? []).filter(cid => cid !== id)
        categories[pId] = { ...categories[pId], childIds: filtered.length ? filtered : undefined }
      }
    }

    if (newParentId && newParentId !== 0) {
      const pId = String(newParentId)
      if (categories[pId])
        categories[pId] = { ...categories[pId], childIds: [...(categories[pId].childIds ?? []), id] }
    }
  }

  function applyOptimisticUpdate(id: CategoryId, categoryValues: CategoryItem, isUpdateChildCategoriesColor: boolean, categoryChildIds: CategoryId[]) {
    const existingChildIds = items.value?.[id]?.childIds
    const updatedItems: Categories = {
      ...items.value,
      [id]: existingChildIds ? { ...categoryValues, childIds: existingChildIds } : categoryValues,
    }

    if (isUpdateChildCategoriesColor && categoryChildIds.length > 0) {
      for (const childId of categoryChildIds) {
        if (updatedItems[childId])
          updatedItems[childId] = { ...updatedItems[childId], color: categoryValues.color }
      }
    }

    syncOptimisticParentChildIds(updatedItems, id, items.value?.[id]?.parentId ?? 0, categoryValues.parentId)

    setCategories(updatedItems)
  }

  function saveCategory({ id, isUpdateChildCategoriesColor, values }: AddCategoryParams) {
    if (id === 'transfer' || id === 'adjustment')
      return

    const categoryChildIds = getChildsIds(id)

    // Frontend IDs are always treated as new creates (server generates real ID)
    const isExisting = !isLocalId(id) && items.value && id in items.value

    // Optimistic UI
    applyOptimisticUpdate(id, values, isUpdateChildCategoriesColor, categoryChildIds)

    if (!pushSaveOp({ entity: 'categories', id, isDemo: isDemo.value, isExisting: !!isExisting, values: values as unknown as Record<string, unknown> }))
      return

    const { api, client } = useConvexClientWithApi()
    const action = isExisting ? 'update' : 'create'

    const categoryData = {
      color: values.color,
      icon: values.icon,
      name: values.name,
      parentId: values.parentId && values.parentId !== 0 ? asConvexId<'categories'>(String(values.parentId)) : 0 as const,
      showInLastUsed: values.showInLastUsed,
      showInQuickSelector: values.showInQuickSelector,
    }

    const mutation = isExisting && isUpdateChildCategoriesColor && categoryChildIds.length > 0
      ? client.mutation(api.categories.updateWithChildren, {
          childIds: categoryChildIds.map(cid => asConvexId<'categories'>(cid)),
          id: asConvexId<'categories'>(id),
          ...categoryData,
        })
      : isExisting
        ? client.mutation(api.categories.update, { id: asConvexId<'categories'>(id), ...categoryData })
        : client.mutation(api.categories.create, categoryData)

    return handleMutationResult({
      action,
      entity: 'categories',
      errorMessage: 'categories.errors.saveFailed',
      id,
      items,
      mutation,

    })
  }

  function deleteCategory(id: CategoryId, trnsIds?: TrnId[]) {
    if (id === 'transfer' || id === 'adjustment')
      return

    // Optimistic UI
    const categories = { ...items.value }
    const category = categories[id]
    if (category?.parentId && category.parentId !== 0) {
      const pId = String(category.parentId)
      const parent = categories[pId]
      if (parent) {
        const filtered = (parent.childIds ?? []).filter(cid => cid !== id)
        categories[pId] = { ...parent, childIds: filtered.length ? filtered : undefined }
      }
    }
    delete categories[id]
    setCategories(categories)

    // Optimistic: remove trns from store immediately (backend cascade handles actual deletion)
    if (trnsIds?.length)
      trnsStore.removeTrnsFromStore(trnsIds)

    if (!pushDeleteOp({ entity: 'categories', id, isDemo: isDemo.value }))
      return

    // Fire-and-forget mutation, cleanup on success
    const { api, client } = useConvexClientWithApi()
    return handleMutationResult({
      action: 'delete',
      entity: 'categories',
      errorMessage: 'categories.errors.deleteFailed',
      id,
      items,
      mutation: client.mutation(api.categories.remove, { id: asConvexId<'categories'>(id) }),

    })
  }

  return {
    cancelPersist: () => debouncedPersist.cancel?.(),
    categoriesForBeParent,
    categoriesIds,
    categoriesIdsForTrnValues,
    categoriesRootIds,
    deleteCategory,
    favoriteCategoriesIds,
    getChildsIds,
    getChildsIdsOrParent,
    getTransactibleIds,
    hasChildren,
    hasItems,
    initCategories,
    isItTransactible,
    items,
    recentCategoriesIds,
    saveCategory,
    setCategories,
    transactibleIds,
    transferCategoriesIds,
  }
})

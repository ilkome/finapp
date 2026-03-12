import { convexCategoriesToMap } from '~~/services/convex/api'

import type { AddCategoryParams, Categories, CategoryId, CategoryItem } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'
import type { RemapInfo } from '~/composables/useStoreSync'

import { compareCategoriesByParentAndName, getTransactibleCategoriesIds } from '~/components/categories/utils'
import { useDemo } from '~/components/demo/useDemo'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { createDebouncedPersist, handleMutationResult, mergeOfflineOps, pushDeleteOp, pushSaveOp } from '~/composables/useStoreSync'
import { createLogger } from '~/utils/logger'

const adjustment: CategoryItem = {
  color: 'var(--text-4)',
  icon: 'mdi:plus-minus',
  name: 'Adjustment',
  parentId: 0,
  showInLastUsed: false,
  showInQuickSelector: false,
}

const transfer: CategoryItem = {
  color: 'var(--text-4)',
  icon: 'mdi:repeat',
  name: 'Transfer',
  parentId: 0,
  showInLastUsed: false,
  showInQuickSelector: false,
}

type CategoriesStore = {
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

    return Object.keys(items.value)
      .filter(id => items.value?.[id]?.parentId === 0 && id !== 'transfer' && id !== 'adjustment')
      .sort((a, b) => compareCategoriesByParentAndName(items.value[a]!, items.value[b]!, items.value))
  })

  const usedCategoryIds = computed(() =>
    new Set(Object.values(trnsStore.items ?? {}).map(trn => trn.categoryId)),
  )

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
    const favoriteIds = new Set(favoriteCategoriesIds.value)

    // Track most recent date per category (single pass)
    const latestDateByCategory = new Map<CategoryId, number>()
    for (const trnId of Object.keys(trnsItems ?? {})) {
      const trn = trnsItems?.[trnId]
      if (!trn || trn.type === TrnType.Transfer || trn.categoryId === 'adjustment')
        continue

      const categoryId = trn.categoryId
      const existing = latestDateByCategory.get(categoryId)
      if (!existing || trn.date > existing)
        latestDateByCategory.set(categoryId, trn.date)
    }

    // Filter valid categories and pick top N by most recent usage
    const sortedEntries: [CategoryId, number][] = Array.from(latestDateByCategory.entries()).sort(([, dateA], [, dateB]) => dateB - dateA)

    const recentIds = sortedEntries.reduce<CategoryId[]>((acc, [categoryId]) => {
      if (acc.length >= maxCategories)
        return acc

      const category = items.value[categoryId]
      if (!category || !category.showInLastUsed || categoryId === 'transfer' || favoriteIds.has(categoryId))
        return acc

      acc.push(categoryId)
      return acc
    }, [])

    return recentIds
      .sort((a, b) => compareCategoriesByParentAndName(items.value[a]!, items.value[b]!, items.value))
  })

  const categoriesIdsForTrnValues = computed<CategoryId[]>(() => {
    return categoriesIds.value.filter((id) => {
      if (id === 'transfer')
        return false
      return !hasChildren(id)
    })
  })

  const debouncedPersist = createDebouncedPersist<Categories>(STORAGE_KEYS.categories)

  async function initCategories() {
    try {
      const { api, client } = useConvexClientWithApi()
      const categories = await client.query(api.categories.list, {})
      let data: Categories | null = categories?.length ? convexCategoriesToMap(categories) : null

      if (data)
        data = await mergeOfflineOps(data, 'categories') as Categories

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

    return Object.keys(items.value).some(id => items.value[id]?.parentId === categoryId)
  }

  function getChildrenIds(categoryId: CategoryId) {
    if (!hasItems.value)
      return []

    const children = Object.keys(items.value)
      .filter(id => items.value[id]?.parentId === categoryId)

    if (!children.length)
      return []

    return children
      .sort((a, b) => compareCategoriesByParentAndName(items.value[a]!, items.value[b]!, items.value))
  }

  function getChildrenIdsOrParent(categoryId: CategoryId) {
    if (!hasItems.value)
      return []

    const children = Object.keys(items.value)
      .filter(id => items.value[id]?.parentId === categoryId)
    return children.length ? children : [categoryId]
  }

  function getTransactibleIds(ids?: CategoryId[]) {
    return getTransactibleCategoriesIds(items.value ?? {}, ids)
  }

  function isTransactible(categoryId: CategoryId) {
    return transactibleIdsSet.value.has(categoryId)
  }

  function applyOptimisticUpdate(id: CategoryId, categoryValues: CategoryItem, isUpdateChildCategoriesColor: boolean, categoryChildIds: CategoryId[]) {
    const updatedItems: Categories = {
      ...(items.value ?? {}),
      [id]: categoryValues,
    }

    if (isUpdateChildCategoriesColor && categoryChildIds.length > 0) {
      for (const childId of categoryChildIds) {
        if (updatedItems[childId])
          updatedItems[childId] = { ...updatedItems[childId], color: categoryValues.color }
      }
    }

    setCategories(updatedItems)
  }

  function saveCategory({ id, isUpdateChildCategoriesColor, values }: AddCategoryParams) {
    if (id === 'transfer' || id === 'adjustment')
      return

    const categoryChildIds = getChildrenIds(id)

    // Frontend IDs are always treated as new creates (server generates real ID)
    const isExisting = !isLocalId(id) && items.value && id in items.value

    // Optimistic UI
    applyOptimisticUpdate(id, values, isUpdateChildCategoriesColor, categoryChildIds)

    if (!pushSaveOp({ entity: 'categories', id, isDemo: !!isDemo.value, isExisting: !!isExisting, values }))
      return

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
    const categories = { ...(items.value ?? {}) }
    delete categories[id]
    setCategories(categories)

    // Optimistic: remove trns from store immediately (backend cascade handles actual deletion)
    if (trnsIds?.length)
      trnsStore.removeTrnsFromStore(trnsIds)

    if (!pushDeleteOp({ entity: 'categories', id, isDemo: !!isDemo.value }))
      return

    // Fire-and-forget mutation, cleanup on success
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
    recentCategoriesIds,
    saveCategory,
    setCategories,
  }
})

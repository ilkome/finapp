import type { Row } from '~~/services/powersync/transforms'

import { watchTable } from '~~/services/powersync/db'
import { deleteRow, upsertRows } from '~~/services/powersync/mutations'
import { categoryToRow, rowToCategory } from '~~/services/powersync/transforms'

import type { AddCategoryParams, Categories, CategoryId, CategoryItem } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'

import { compareCategoryIds, computeChildrenDiff, getTransactibleCategoriesIds } from '~/components/categories/utils'
import { useDemo } from '~/components/demo/useDemo'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { persistStoreCache } from '~/composables/useStoreCache'
import { createDebouncedPersist, showErrorToast } from '~/composables/useStoreSync'
import { useSupabaseAuth } from '~/composables/useSupabase'
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
  categoriesForBeParent: ComputedRef<CategoryId[]>
  categoriesIdsForTrnValues: ComputedRef<CategoryId[]>
  categoriesRootIds: ComputedRef<CategoryId[]>
  deleteCategory: (id: CategoryId, trnsIds?: TrnId[]) => Promise<void> | void
  favoriteCategoriesIds: ComputedRef<CategoryId[]>
  getChildrenIds: (categoryId: CategoryId) => CategoryId[]
  getChildrenIdsOrParent: (categoryId: CategoryId) => CategoryId[]
  getTransactibleIds: (ids?: CategoryId[]) => CategoryId[]
  hasChildren: (categoryId: CategoryId) => boolean
  hasItems: ComputedRef<boolean>
  initCategories: () => void
  isLoaded: import('vue').Ref<boolean>
  isTransactible: (categoryId: CategoryId) => boolean
  items: import('vue').ShallowRef<Categories>
  primeFromCache: (data: Categories | null) => void
  recentCategoriesIds: ComputedRef<CategoryId[]>
  saveCategory: (params: AddCategoryParams) => Promise<void> | void
  setCategories: (values: Categories | null) => void
}

const logger = createLogger('categories')

export const useCategoriesStore = defineStore('categories', (): CategoriesStore => {
  const trnsStore = useTrnsStore()
  const { isDemo } = useDemo()
  const { uid } = useSupabaseAuth()

  const items = shallowRef<Categories>({ adjustment, transfer })
  const hasItems = computed(() =>
    Object.keys(items.value).some(id => id !== 'transfer' && id !== 'adjustment'),
  )
  // True after the first local-SQLite emission; reset on (re)subscribe so a new user waits for theirs.
  const isLoaded = ref(false)

  let watchController: AbortController | null = null

  const categoriesIds = computed(() => Object.keys(items.value))

  // Child ids grouped by parentId, sorted once per `items` change.
  const childrenMap = computed(() => {
    const all = items.value
    const map = new Map<CategoryId, CategoryId[]>()
    for (const id in all) {
      const parentId = all[id]?.parentId
      if (!parentId) // root (parentId 0) - not a child of any category
        continue
      const group = map.get(parentId)
      if (group)
        group.push(id)
      else
        map.set(parentId, [id])
    }
    for (const group of map.values())
      group.sort((a, b) => compareCategoryIds(a, b, all))
    return map
  })

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

  /** Real mode: subscribe to local SQLite. setCategories re-adds synthetic entries. */
  function initCategories(): void {
    if (isDemo.value)
      return
    watchController?.abort()
    isLoaded.value = false // re-subscribe (e.g. different user) waits for a fresh emission
    let isFirstEmit = true
    watchController = watchTable<Row>('SELECT * FROM categories', [], (rows) => {
      const isFirst = isFirstEmit
      isFirstEmit = false
      isLoaded.value = true
      if (!rows.length) {
        // An empty FIRST emission means local SQLite hasn't received the first sync yet
        // (fresh device) - keep the primed cache. Later empty emissions are genuine wipes.
        if (isFirst && hasItems.value)
          return
        setCategories(null)
        return
      }
      const map: Categories = {} as Categories
      for (const row of rows)
        map[row.id] = rowToCategory(row)
      setCategories(map)
    })
    logger.log('watching categories')
  }

  function setCategories(values: Categories | null) {
    const categories = values ? { ...values, adjustment, transfer } : { adjustment, transfer }
    items.value = categories
    if (isDemo.value)
      debouncedPersist(categories)
    else
      persistStoreCache('categories', categories)
  }

  /** Cold-start paint from the snapshot before the watch emits; re-adds the synthetic entries. */
  function primeFromCache(data: Categories | null): void {
    if (isDemo.value || !data || isLoaded.value)
      return
    items.value = { ...data, adjustment, transfer }
  }

  function hasChildren(categoryId: CategoryId) {
    if (!hasItems.value)
      return false

    const category = items.value[categoryId]
    if (!category || category.parentId !== 0)
      return false

    return (childrenMap.value.get(categoryId)?.length ?? 0) > 0
  }

  function getChildrenIds(categoryId: CategoryId) {
    if (!hasItems.value)
      return []

    return childrenMap.value.get(categoryId)?.slice() ?? []
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

    const prev = items.value
    const prevChildIds = getChildrenIds(id)
    const useChildrenDiff = Array.isArray(nextChildIds)
    const diff = useChildrenDiff
      ? computeChildrenDiff(prevChildIds, nextChildIds!)
      : { added: [] as CategoryId[], removed: [] as CategoryId[] }
    const hasChildrenDiff = diff.added.length > 0 || diff.removed.length > 0
    // Children that stay under this parent - safe color propagation targets
    const keptChildIds = useChildrenDiff
      ? prevChildIds.filter(cid => nextChildIds!.includes(cid))
      : prevChildIds

    applyOptimisticUpdate(
      id,
      values,
      isUpdateChildCategoriesColor,
      keptChildIds,
      hasChildrenDiff ? diff : undefined,
    )

    if (isDemo.value)
      return

    // Persist every category whose row changed during the optimistic update, in one
    // transaction so a partial local-write failure can't leave SQLite half-updated.
    const touched = new Set<CategoryId>([id])
    if (isUpdateChildCategoriesColor) {
      for (const cid of keptChildIds) touched.add(cid)
    }
    for (const cid of diff.added) touched.add(cid)
    for (const cid of diff.removed) touched.add(cid)

    const userId = uid.value ?? ''
    const rows: { id: CategoryId, row: Record<string, unknown> }[] = []
    for (const cid of touched) {
      const item = items.value[cid]
      if (item)
        rows.push({ id: cid, row: categoryToRow(item, userId) })
    }

    return upsertRows('categories', rows)
      .catch((e) => {
        setCategories(prev) // roll back the optimistic update if the local write failed
        logger.error('saveCategory failed', e)
        showErrorToast('categories.errors.saveFailed')
      })
  }

  function deleteCategory(id: CategoryId, trnsIds?: TrnId[]) {
    if (id === 'transfer' || id === 'adjustment')
      return

    const prevCategories = items.value
    const prevTrns = trnsStore.items
    const categories = { ...items.value }
    delete categories[id]
    setCategories(categories)

    if (trnsIds?.length)
      trnsStore.removeTrnsFromStore(trnsIds)

    if (isDemo.value)
      return

    // Cascade: delete the category and its transactions.
    const writes: Promise<void>[] = [deleteRow('categories', id)]
    if (trnsIds?.length) {
      for (const trnId of trnsIds) writes.push(deleteRow('trns', trnId))
    }

    return Promise.all(writes)
      .then(() => undefined)
      .catch((e) => {
        // Roll back the category and its cascaded trns if the local write failed.
        setCategories(prevCategories)
        trnsStore.setTrns(prevTrns)
        logger.error('deleteCategory failed', e)
        showErrorToast('categories.errors.deleteFailed')
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
    isLoaded,
    isTransactible,
    items,
    primeFromCache,
    recentCategoriesIds,
    saveCategory,
    setCategories,
  }
})

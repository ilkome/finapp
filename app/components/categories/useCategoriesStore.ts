import { getDataAndWatch, removeData, saveData, unsubscribeData, updateData } from '~~/services/firebase/api'
import localforage from 'localforage'
import { type ComputedRef, type ShallowRef, computed, shallowRef } from 'vue'
import { deepUnref } from 'vue-deepunref'

import type { AddCategoryParams, Categories, CategoryId, CategoryItem, CategoryItemWithId } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'

import { getPreparedFormData } from '~/components/categories/getForm'
import { compareCategoriesByParentAndName, getTransactibleCategoriesIds, getTransferCategoriesIds } from '~/components/categories/utils'
import { useDemo } from '~/components/demo/useDemo'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUserStore'

const transfer: CategoryItem = {
  childIds: [],
  color: 'var(--c-blue-1)',
  icon: 'mdi:repeat',
  name: 'Transfer',
  order: 9999,
  parentId: 0,
  showInLastUsed: false,
  showInQuickSelector: false,
}

type CategoriesStore = {
  addCategory: (params: AddCategoryParams) => Promise<void>
  categoriesForBeParent: ComputedRef<CategoryId[]>
  categoriesIds: ComputedRef<CategoryId[]>
  categoriesIdsForTrnValues: ComputedRef<CategoryId[]>
  categoriesRootIds: ComputedRef<CategoryId[]>
  deleteCategory: (id: CategoryId, trnsIds?: TrnId[]) => Promise<void>
  favoriteCategoriesIds: ComputedRef<CategoryId[]>
  formatCategories: (items: Categories) => Categories
  getChildsIds: (categoryId: CategoryId) => CategoryId[]
  getChildsIdsOrParent: (categoryId: CategoryId) => CategoryId[]
  getTransactibleIds: (ids?: CategoryId[]) => CategoryId[]
  hasChildren: (categoryId: CategoryId) => boolean
  hasItems: ComputedRef<boolean>
  initCategories: () => void
  isItTransactible: (categoryId: CategoryId) => boolean
  items: ShallowRef<Categories>
  recentCategoriesIds: ComputedRef<CategoryId[]>
  saveCategoriesOrder: (ids: CategoryId[]) => void
  setCategories: (values: Categories | null) => void
  transactibleIds: ComputedRef<CategoryId[]>
  transferCategoriesIds: ComputedRef<CategoryId[]>
  unsubscribeCategories: () => void
}

export const useCategoriesStore = defineStore('categories', (): CategoriesStore => {
  const userStore = useUserStore()
  const trnsStore = useTrnsStore()
  const { addDemoCategory, deleteDemoCategory, isDemo } = useDemo()

  const items = shallowRef<Categories>({ transfer })
  const hasItems = computed(() => {
    if (Object.keys(items.value).filter(id => id !== 'transfer').length > 0)
      return true

    return false
  })
  const transferCategoriesIds = computed(() => getTransferCategoriesIds(items.value))

  const categoriesIds = computed(() => {
    if (!items.value)
      return []

    return Object.keys(items.value)
  })

  const categoriesRootIds = computed(() => {
    if (!hasItems.value || !items.value)
      return []

    return Object.keys(items.value)
      .filter(id => items.value?.[id]?.parentId === 0)
      .sort((a, b) => compareCategoriesByParentAndName(items.value[a]!, items.value[b]!, items.value))
  })

  const categoriesForBeParent = computed(() => {
    if (!hasItems.value || !items.value)
      return []

    return categoriesRootIds.value.filter((id: CategoryId) => {
      const hasTrnsInCategory = Object.values(trnsStore.items ?? {})?.some(trn => trn.categoryId === id)

      if (hasTrnsInCategory || transferCategoriesIds.value.includes(id))
        return false

      return id
    })
  })

  const transactibleIds = computed(() => getTransactibleCategoriesIds(items.value))

  const favoriteCategoriesIds = computed(() => {
    if (!hasItems.value)
      return []

    const filteredCategories = Object.keys(items.value)
      .filter(id => items.value[id].showInQuickSelector)
      .map(id => ({ id, ...items.value[id] }))

    return filteredCategories
      .sort((a, b) => {
        const parentNameA = items.value[a.parentId]?.name || ''
        const parentNameB = items.value[b.parentId]?.name || ''

        // First compare by parent name
        if (parentNameA !== parentNameB)
          return parentNameA.localeCompare(parentNameB)

        // If parent names are equal, compare by category name
        return a.name.localeCompare(b.name)
      })
      .map(c => c.id)
  })

  const recentCategoriesIds = computed(() => {
    if (!hasItems.value || !trnsStore.hasItems)
      return []

    const trnsItems = trnsStore.items
    const maxCategories = Math.min(categoriesIds.value.length, 16)

    // Get sorted transaction IDs, excluding type 2 (transfers)
    const recentTrnsIds = Object.keys(trnsItems)
      .filter(id => trnsItems[id]?.type !== 2)
      .sort((a, b) => trnsItems[b]?.date - trnsItems[a]?.date)

    // Collect unique valid categories
    const categories = recentTrnsIds.reduce<CategoryItemWithId[]>((acc, trnId) => {
      if (acc.length >= maxCategories)
        return acc

      const categoryId = trnsItems[trnId]?.categoryId
      const category = categoryId ? items.value[categoryId] : undefined

      const shouldSkip = !category
        || ('showInLastUsed' in category && !category.showInLastUsed)
        || acc.some(c => c.id === categoryId)
        || transferCategoriesIds.value.includes(categoryId)
        || favoriteCategoriesIds.value.includes(categoryId)

      if (shouldSkip)
        return acc

      acc.push({ id: categoryId, ...category })
      return acc
    }, [])

    return categories
      .sort((a, b) => compareCategoriesByParentAndName(a, b, items.value))
      .map(c => c.id)
  })

  const categoriesIdsForTrnValues = computed<CategoryId[]>(() => {
    return categoriesIds.value.filter((id) => {
      const isTransferCategory = transferCategoriesIds.value.includes(id)
      const category = items.value[id]
      const hasNoChildren = !category?.childIds?.length

      return !isTransferCategory && hasNoChildren
    })
  })

  function formatCategories(items: Categories): Categories {
    const formattedItems = { ...items }

    // Step 1: Build parent-child relationships
    for (const categoryId in formattedItems) {
      const category = formattedItems[categoryId]
      const parentId = category?.parentId

      if (!parentId || !formattedItems[parentId])
        continue

      const parent = formattedItems[parentId]
      parent.childIds = parent.childIds || []

      if (!parent.childIds.includes(categoryId))
        parent.childIds.push(categoryId)
    }

    // Step 2: Set default values and clean up invalid child references
    for (const categoryId in formattedItems) {
      const category = formattedItems[categoryId]!

      // Set default values for optional properties
      formattedItems[categoryId] = {
        ...category,
        icon: category.icon.replace('mdi mdi-', 'mdi:'),
        showInLastUsed: category.showInLastUsed ?? false,
        showInQuickSelector: category.showInQuickSelector ?? false,
      }

      // Remove references to non-existent child categories
      if (category.childIds?.length)
        formattedItems[categoryId].childIds = category.childIds.filter(childId => formattedItems[childId])
    }

    return formattedItems
  }

  function initCategories() {
    getDataAndWatch(
      `users/${userStore.uid}/categories`,
      (categories: Categories) => setCategories(categories),
    )
  }

  function setCategories(values: Categories | null) {
    items.value = values ? formatCategories({ ...values, transfer }) : { transfer }
    localforage.setItem('finapp.categories', deepUnref(items.value))
  }

  function unsubscribeCategories() {
    const userStore = useUserStore()
    unsubscribeData(`users/${userStore.uid}/categories`)
    setCategories(null)
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

    return hasChildren(categoryId)
      ? Object.keys(items.value)
          .filter(id => items.value[id]?.parentId === categoryId)
          .sort((a, b) => compareCategoriesByParentAndName(items.value[a]!, items.value[b]!, items.value))
      : []
  }

  function getChildsIdsOrParent(categoryId: CategoryId) {
    if (!hasItems.value)
      return []

    return hasChildren(categoryId)
      ? Object.keys(items.value).filter(id => items.value[id]?.parentId === categoryId)
      : [categoryId]
  }

  function saveCategoriesOrder(ids: CategoryId[]) {
    const userStore = useUserStore()
    updateData(`users/${userStore.uid}/categories`, { order: ids })
  }

  function getTransactibleIds(ids?: CategoryId[]) {
    return getTransactibleCategoriesIds(items.value ?? {}, ids)
  }

  function isItTransactible(categoryId: CategoryId) {
    return transactibleIds.value.includes(categoryId)
  }

  async function addCategory({ id, isUpdateChildCategoriesColor, values }: AddCategoryParams) {
    const uid = userStore.uid
    const categoryChildIds = getChildsIds(id)
    const categoryValues = getPreparedFormData(values)

    if (isDemo.value) {
      return addDemoCategory({
        childIds: categoryChildIds,
        id,
        isUpdateChildCategoriesColor,
        values,
      })
    }

    // Update category
    await saveData(`users/${uid}/categories/${id}`, categoryValues)

    // Update child categories colors
    if (isUpdateChildCategoriesColor && categoryChildIds) {
      for (const childId of categoryChildIds)
        await saveData(`users/${uid}/categories/${childId}/color`, categoryValues.color)
    }
  }

  async function deleteCategory(id: CategoryId, trnsIds?: TrnId[]) {
    if (isDemo.value) {
      deleteDemoCategory(id, trnsIds)
    }
    else {
      await removeData(`users/${userStore.uid}/categories/${id}`)
      if (trnsIds)
        await trnsStore.deleteTrnsByIds(trnsIds)
    }
  }

  return {
    addCategory,
    categoriesForBeParent,
    categoriesIds,
    categoriesIdsForTrnValues,
    categoriesRootIds,
    deleteCategory,
    favoriteCategoriesIds,
    formatCategories,
    getChildsIds,
    getChildsIdsOrParent,
    getTransactibleIds,
    hasChildren,
    hasItems,
    initCategories,
    isItTransactible,
    items,
    recentCategoriesIds,
    saveCategoriesOrder,
    setCategories,
    transactibleIds,
    transferCategoriesIds,
    unsubscribeCategories,
  }
})

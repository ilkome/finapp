import _sortby from 'lodash.sortby'
import localforage from 'localforage'
import { deepUnref } from 'vue-deepunref'
import { type ComputedRef, type ShallowRef, computed, shallowRef } from 'vue'
import type { AddCategoryParams, Categories, CategoryId, CategoryItem } from '~/components/categories/types'
import { getDataAndWatch, saveData, unsubscribeData, updateData } from '~~/services/firebase/api'
import { getPreparedFormData } from '~/components/categories/getForm'
import { getTransactibleCategoriesIds, getTransferCategoriesIds } from '~/components/categories/utils'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUserStore'
import { useDemo } from '~/components/demo/useDemo'

const transfer: CategoryItem = {
  childIds: [],
  color: 'var(--c-blue-1)',
  icon: 'mdi mdi-repeat',
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
  favoriteCategoriesIds: ComputedRef<CategoryId[]>
  getChildsIds: (categoryId: CategoryId) => CategoryId[]
  getChildsIdsOrParent: (categoryId: CategoryId) => CategoryId[]
  getTransactibleIds: (ids?: CategoryId[]) => CategoryId[]
  hasChildren: (categoryId: CategoryId) => boolean
  hasItems: ComputedRef<boolean>
  initCategories: () => void
  items: ShallowRef<Categories>
  recentCategoriesIds: ComputedRef<CategoryId[]>
  saveCategoriesOrder: (ids: CategoryId[]) => void
  setCategories: (values: Categories | null) => void
  transferCategoriesIds: ComputedRef<CategoryId[]>
  unsubscribeCategories: () => void
}

export const useCategoriesStore = defineStore('categories', (): CategoriesStore => {
  const userStore = useUserStore()
  const trnsStore = useTrnsStore()
  const { addDemoCategory, isDemo } = useDemo()

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
      .sort((a, b) => items.value?.[a]?.name.localeCompare(items.value?.[b]?.name) ?? '')
  })

  const categoriesForBeParent = computed(() => {
    if (!hasItems.value || !items.value)
      return []

    return categoriesRootIds.value.filter((id: CategoryId) => {
      const hasTrnsInCategory = Object.values(trnsStore.items).some(
        trn => trn.categoryId === id,
      )

      if (hasTrnsInCategory || transferCategoriesIds.value.includes(id))
        return false

      return id
    })
  })

  const favoriteCategoriesIds = computed(() => {
    if (!hasItems.value)
      return []

    const filteredCategories = Object.keys(items.value)
      .filter(id => items.value[id].showInQuickSelector)
      .map(id => ({ id, ...items.value[id] }))

    return _sortby(filteredCategories, category => [
      items.value[category.parentId]?.name || false,
      category.name,
    ]).map(c => c.id)
  })

  const recentCategoriesIds = computed(() => {
    // Early return if no data
    if (!hasItems.value || !trnsStore.hasItems)
      return []

    const trnsItems = trnsStore.items
    const maxCategories = Math.min(categoriesIds.value.length, 16)

    // Get sorted transaction IDs, excluding type 2
    const trnsIds = Object.keys(trnsItems)
      .filter(id => trnsItems[id]?.type !== 2)
      .sort((a, b) => trnsItems[b]?.date - trnsItems[a]?.date)

    // Get unique categories from transactions
    return trnsIds.reduce((acc: CategoryItem[], trnId: string) => {
      if (acc.length >= maxCategories)
        return acc

      const categoryId = trnsItems[trnId]?.categoryId
      const category = categoryId ? items.value[categoryId] : undefined

      // Skip if category is invalid or shouldn't be shown
      if (!category || ('showInLastUsed' in category && !category.showInLastUsed))
        return acc

      // Skip if category is already in list or is special type
      if (
        acc.some(c => c.id === categoryId)
        || transferCategoriesIds.value.includes(categoryId)
        || favoriteCategoriesIds.value.includes(categoryId)
      ) {
        return acc
      }

      acc.push({ id: categoryId, ...category })
      return acc
    }, [])
      .sort((a, b) => {
        const parentNameA = items.value[a.parentId]?.name || ''
        const parentNameB = items.value[b.parentId]?.name || ''
        return parentNameA.localeCompare(parentNameB) || a.name.localeCompare(b.name)
      })
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
        showInLastUsed: category.showInLastUsed ?? false,
        showInQuickSelector: category.showInQuickSelector ?? false,
      }

      // Remove references to non-existent child categories
      if (category.childIds?.length) {
        formattedItems[categoryId].childIds = category.childIds.filter(
          childId => formattedItems[childId],
        )
      }
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
    if (values) {
      const valuesWithTransfer = formatCategories({ ...values, transfer })
      items.value = valuesWithTransfer
      localforage.setItem('finapp.categories', deepUnref(valuesWithTransfer))
      return
    }

    items.value = { transfer }
    localforage.setItem('finapp.categories', null)
  }

  function unsubscribeCategories() {
    const userStore = useUserStore()
    unsubscribeData(`users/${userStore.uid}/categories`)
    setCategories(null)
  }

  function hasChildren(categoryId: CategoryId) {
    if (!hasItems.value)
      return false

    return (items.value[categoryId]?.childIds && items.value[categoryId]?.childIds?.length > 0) ?? false
  }

  function getChildsIds(categoryId: CategoryId) {
    if (!hasItems.value)
      return []

    return hasChildren(categoryId)
      ? Object.keys(items.value)
        .filter(id => items.value[id]?.parentId === categoryId)
        .sort((a, b) => items.value[a]!.name.localeCompare(items.value[b]!.name))
      : []
  }

  function getChildsIdsOrParent(categoryId: CategoryId) {
    if (!hasItems.value)
      return []

    return hasChildren(categoryId)
      ? Object.keys(items.value)
        .filter(id => items.value[id]?.parentId === categoryId)
      : [categoryId]
  }

  function saveCategoriesOrder(ids: CategoryId[]) {
    const userStore = useUserStore()
    updateData(`users/${userStore.uid}/categories`, { order: ids })
  }

  function getTransactibleIds(ids?: CategoryId[]) {
    return getTransactibleCategoriesIds(items.value ?? {}, ids)
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

  return {
    addCategory,
    categoriesForBeParent,
    categoriesIds,
    categoriesIdsForTrnValues,
    categoriesRootIds,
    favoriteCategoriesIds,
    formatCategories,
    getChildsIds,
    getChildsIdsOrParent,
    getTransactibleIds,
    hasChildren,
    hasItems,
    initCategories,
    items,
    recentCategoriesIds,
    saveCategoriesOrder,
    setCategories,
    transferCategoriesIds,
    unsubscribeCategories,
  }
})

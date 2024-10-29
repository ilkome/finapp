import _sortby from 'lodash.sortby'
import { deepUnref } from 'vue-deepunref'
import localforage from 'localforage'
import {
  getDataAndWatch,
  unsubscribeData,
  updateData,
} from '~~/services/firebase/api'
import type {
  Categories,
  CategoryId,
  CategoryItem,
} from '~/components/categories/types'
import { getTransferCategoriesIds } from '~/components/categories/getCategories'
import { getTransactibleCategoriesIds } from '~/components/categories/utils'

import { useUserStore } from '~/components/user/useUserStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const transfer: CategoryItem = {
  childIds: [],
  color: 'var(--c-blue-1)',
  icon: 'mdi mdi-repeat',
  name: 'Transfer',
  order: 9999,
  parentId: 0,
  showInLastUsed: false,
  showInQuickSelector: false,
  showStat: false,
}

export const useCategoriesStore = defineStore('categories', () => {
  const userStore = useUserStore()
  const trnsStore = useTrnsStore()

  const items = shallowRef<Categories | null>({ transfer })
  const hasItems = computed(() => {
    if (Object.keys(items.value ?? {}).filter(id => id !== 'transfer').length > 0)
      return true

    return false
  })
  const transferCategoriesIds = computed(() => getTransferCategoriesIds(items.value ?? {}))

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
      const hasTrnsInCategory = Object.values(trnsStore.items ?? {}).some(
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
    if (!hasItems.value || !trnsStore.hasItems)
      return []

    const trnsItems = trnsStore.items ?? {}

    const trnsIds = Object.keys(trnsStore.items)
      .filter(id => trnsItems[id]?.type !== 2)
      .sort((a, b) => trnsItems[b]?.date - trnsItems[a]?.date)

    const lastCategories: Record<
      CategoryId,
      CategoryItem & Record<'id', CategoryId>
    >[] = []

    for (const trnId of trnsIds) {
      if (lastCategories.length > 16)
        break

      const categoryId = trnsItems[trnId].categoryId
      const category = items.value[categoryId]

      if (
        !category
        || ('showInLastUsed' in category && !category.showInLastUsed)
      ) {
        continue
      }

      const isCategoryAlreadyAdded = lastCategories.some(
        c => c.id === categoryId,
      )
      const isTransferCategory
        = transferCategoriesIds.value.includes(categoryId)
      const isCategoryInQuickSelector
        = favoriteCategoriesIds.value.includes(categoryId)

      if (
        !isCategoryAlreadyAdded
        && !isTransferCategory
        && !isCategoryInQuickSelector
      ) {
        lastCategories.push({
          id: categoryId,
          ...category,
        })
      }
    }

    return _sortby(lastCategories, category => [
      items.value[category.parentId]?.name || false,
      category.name,
    ]).map(c => c.id)
  })

  const categoriesIdsForTrnValues = computed(() =>
    categoriesIds.value.filter(
      id =>
        !transferCategoriesIds.value.includes(id) && (!items.value[id]?.childIds || items.value[id]?.childIds?.length === 0),
    ),
  )

  /**
   * Methods
   */
  function formatCategories(items: Categories): Categories {
    const formattedItems = { ...items }

    // Add child categories to root categories
    for (const categoryId in formattedItems) {
      const parentCategoryId = formattedItems[categoryId]?.parentId
      if (parentCategoryId !== 0 && parentCategoryId && formattedItems[parentCategoryId]) {
        if (formattedItems[parentCategoryId]?.childIds && !formattedItems[parentCategoryId]?.childIds?.includes(categoryId)) {
          formattedItems[parentCategoryId]?.childIds?.push(categoryId)
        }
        else if (parentCategoryId && formattedItems[parentCategoryId]) {
          formattedItems[parentCategoryId].childIds = [categoryId]
        }
      }
    }

    // Add missing props
    for (const categoryId in formattedItems) {
      const cat = formattedItems[categoryId]!

      if (cat.showInLastUsed === undefined) {
        formattedItems[categoryId] = {
          ...cat,
          showInLastUsed: false,
        }
      }

      if (cat.showInQuickSelector === undefined) {
        formattedItems[categoryId] = {
          ...cat,
          showInQuickSelector: false,
        }
      }

      if (cat && cat.childIds) {
        formattedItems[categoryId] = cat

        for (const childCatId of cat.childIds) {
          if (!formattedItems[childCatId]) {
            formattedItems[categoryId].childIds = formattedItems[categoryId].childIds?.filter(
              id => id !== childCatId,
            )
          }
        }
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

    items.value = null
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

    return items.value[categoryId]?.childIds && items.value[categoryId]?.childIds?.length > 0
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

  return {
    categoriesForBeParent,
    categoriesIds,
    categoriesIdsForTrnValues,
    categoriesRootIds,
    favoriteCategoriesIds,
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

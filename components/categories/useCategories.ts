import _sortby from 'lodash.sortby'
import { deepUnref } from 'vue-deepunref'
import localforage from 'localforage'
import type {
  Categories,
  CategoryId,
  CategoryItem,
} from '~/components/categories/types'
import {
  getDataAndWatch,
  unsubscribeData,
  updateData,
} from '~/services/firebase/api'
import { getTransactibleCategoriesIds, getTransferCategoriesIds } from '~/components/categories/getCategories'

import { useUserStore } from '~/components/user/useUser'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { TrnId } from '~/components/trns/types'
import { getTotal } from '~/components/amount/getTotal'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export const useCategoriesStore = defineStore('categories', () => {
  const transfer: CategoryItem = {
    color: 'var(--c-blue-1)',
    icon: 'mdi mdi-repeat',
    name: 'Transfer',
    order: 9999,
    parentId: 0,
    childIds: [],
    showInLastUsed: false,
    showInQuickSelector: false,
    showStat: false,
  }

  const trnsStore = useTrnsStore()
  const currenciesStore = useCurrenciesStore()
  const walletsStore = useWalletsStore()

  const items = ref<Categories>({ transfer })

  const hasCategories = computed(() => {
    if (!items.value)
      return false

    // More than 1 because categories has 1 static category "Transfer"
    // TODO: use get transfers categories and exclude them from the list
    if (Object.keys(items.value).length > 1)
      return true
  })

  const categoriesIds = computed(() => {
    if (!items.value)
      return []

    return Object.keys(items.value)
  })

  const transferCategoriesIds = computed(() =>
    getTransferCategoriesIds(items.value),
  )

  const categoriesRootIds = computed(() => {
    if (!hasCategories.value || !items.value)
      return []

    return Object.keys(items.value)
      .filter(id => items.value[id].parentId === 0)
      .sort((a, b) => items.value[a].name.localeCompare(items.value[b].name))
  })

  const categoriesForBeParent = computed(() => {
    if (!hasCategories.value || !items.value)
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
    if (!hasCategories.value)
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
    if (!hasCategories.value || !trnsStore.hasTrns)
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
      )
        continue

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
    } // Add a comma here

    return _sortby(lastCategories, category => [
      items.value[category.parentId]?.name || false,
      category.name,
    ]).map(c => c.id)
  })

  const categoriesIdsForTrnValues = computed(() =>
    categoriesIds.value.filter(
      id =>
        !transferCategoriesIds.value.includes(id)
        && items.value[id].childIds?.length === 0,
    ),
  )

  /**
   * Methods
   */
  function initCategories() {
    const userStore = useUserStore()

    getDataAndWatch(
      `users/${userStore.uid}/categories`,
      (items: Categories) => {
        // add child categories to root categories
        for (const categoryId in items) {
          const parentCategoryId = items[categoryId].parentId
          if (parentCategoryId !== 0 && items[parentCategoryId]) {
            items[parentCategoryId].childIds
              ? !items[parentCategoryId].childIds?.includes(categoryId)
              && items[parentCategoryId].childIds?.push(categoryId)
              : (items[parentCategoryId].childIds = [categoryId])
          }
        }

        // Add missing props
        for (const categoryId in items) {
          const cat = items[categoryId]

          if (cat.showInLastUsed === undefined) {
            items[categoryId] = {
              ...cat,
              showInLastUsed: false,
            }
          }

          if (cat.showInQuickSelector === undefined) {
            items[categoryId] = {
              ...cat,
              showInQuickSelector: false,
            }
          }

          if (cat.childIds) {
            items[categoryId] = {
              ...cat,
              showInLastUsed: false,
              showInQuickSelector: false,
            }

            for (const childCatId of cat.childIds) {
              if (!items[childCatId]) {
                items[categoryId].childIds = items[categoryId].childIds?.filter(
                  id => id !== childCatId,
                )
              }
            }
          }
        }

        setCategories(items)
      },
    )
  }

  function setCategories(values: Categories | null) {
    if (values == null) {
      items.value = null
      localforage.setItem('finapp.categories', null)
    }

    const valuesWithTransfer = { ...values, transfer }
    items.value = valuesWithTransfer
    localforage.setItem('finapp.categories', deepUnref(valuesWithTransfer))
  }

  function unsubscribeCategories() {
    const userStore = useUserStore()
    unsubscribeData(`users/${userStore.uid}/categories`)
    setCategories(null)
  }

  function isCategoryHasChildren(categoryId: CategoryId) {
    if (!hasCategories.value)
      return false

    return items.value[categoryId].childIds?.length > 0
  }

  function getChildCategoriesIds(categoryId: CategoryId) {
    if (!hasCategories.value)
      return []

    if (items.value[categoryId]?.parentId === 0) {
      return Object.keys(items.value).filter(
        id => items.value[id]?.parentId === categoryId,
      )
    }

    return []
  }

  function saveCategoriesOrder(ids: CategoryId[]) {
    const userStore = useUserStore()
    updateData(`users/${userStore.uid}/categories`, { order: ids })
  }

  function getTransactibleIds(ids: CategoryId[]) {
    return getTransactibleCategoriesIds(ids, items.value)
  }

  return {
    items,
    categoriesIds,
    categoriesRootIds,
    categoriesIdsForTrnValues,
    categoriesForBeParent,
    favoriteCategoriesIds,
    hasCategories,
    recentCategoriesIds,
    transferCategoriesIds,

    initCategories,
    setCategories,
    isCategoryHasChildren,
    getChildCategoriesIds,
    unsubscribeCategories,
    saveCategoriesOrder,

    getTransactibleIds,
  }
})

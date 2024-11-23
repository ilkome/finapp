import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export function useFilter() {
  const router = useRouter()
  const route = useRoute()
  const trnsStore = useTrnsStore()
  const categoriesStore = useCategoriesStore()
  const walletsStore = useWalletsStore()

  /**
   * Wallets
   */
  const walletsIds = computed<CategoryId[]>(() => Array.isArray(route.query.filterWallets)
    ? (route.query.filterWallets as CategoryId[]).filter(id => walletsStore.items?.[id])
    : route.query.filterWallets
      ? [route.query.filterWallets]
      : [],
  )

  function setWalletId(walletId: WalletId) {
    if (walletsIds.value.includes(walletId))
      return

    router.push({
      query: {
        ...route.query,
        filterWallets: [...walletsIds.value, walletId],
      },
    })
  }

  function toggleWalletId(walletId: WalletId) {
    if (walletsIds.value.includes(walletId)) {
      removeWalletId(walletId)
      return
    }

    setWalletId(walletId)
  }

  function setWallets(newWalletsIds: WalletId[]) {
    let uniqueWalletsIds: WalletId[] = []

    if (newWalletsIds.every(id => walletsIds.value.includes(id))) {
      uniqueWalletsIds = walletsIds.value.filter(id => !newWalletsIds.includes(id))
    }
    else {
      uniqueWalletsIds = [...new Set([...walletsIds.value, ...newWalletsIds])]
    }

    router.push({
      query: {
        ...route.query,
        filterWallets: uniqueWalletsIds,
      },
    })
  }

  function removeWalletId(walletId: WalletId) {
    router.push({
      query: {
        ...route.query,
        filterWallets: [...walletsIds.value.filter(id => id !== walletId)],
      },
    })
  }

  /**
   * Categories
   */
  const catsIds = computed<CategoryId[]>(() => Array.isArray(route.query.filterCategories)
    ? (route.query.filterCategories as CategoryId[]).filter(id => categoriesStore.items[id])
    : route.query.filterCategories
      ? [route.query.filterCategories]
      : [],
  )

  function setCategoryId(categoryId: CategoryId) {
    if (catsIds.value.includes(categoryId))
      return

    router.push({
      query: {
        ...route.query,
        filterCategories: [...catsIds.value, categoryId],
      },
    })
  }

  function setCategories(newCategoriesIds: CategoryId[]) {
    let uniqueCategoriesIds: CategoryId[] = []

    if (newCategoriesIds.every(id => catsIds.value.includes(id))) {
      uniqueCategoriesIds = catsIds.value.filter(id => !newCategoriesIds.includes(id))
    }
    else {
      uniqueCategoriesIds = [...new Set([...catsIds.value, ...newCategoriesIds])]
    }

    router.push({
      query: {
        ...route.query,
        filterCategories: uniqueCategoriesIds,
      },
    })
  }

  function removeCategoryId(categoryId: CategoryId) {
    router.push({
      query: {
        ...route.query,
        filterCategories: [...catsIds.value.filter(id => id !== categoryId)],
      },
    })
  }

  function toggleCategoryId(categoryId: CategoryId) {
    if (catsIds.value.includes(categoryId)) {
      removeCategoryId(categoryId)
      return
    }

    setCategoryId(categoryId)
  }

  /**
   * Clear
   */
  function clearFilter() {
    // catsIds.value = []
    // walletsIds.value = []
    router.push({ query: undefined })
  }

  const isShow = computed(() => catsIds.value.length > 0 || walletsIds.value.length > 0)

  function getTrnsIdsWithFilter() {
    return trnsStore.getStoreTrnsIds({
      categoriesIds: catsIds.value,
      walletsIds: walletsIds.value,
    }, {
      includesChildCategories: true,
    })
  }

  return {
    catsIds,
    clearFilter,
    getTrnsIdsWithFilter,
    isShow,
    removeCategoryId,
    removeWalletId,
    setCategories,
    setCategoryId,
    setWalletId,
    setWallets,
    toggleCategoryId,
    toggleWalletId,
    walletsIds,
  }
}

import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

function createQueryFilter<T extends string>(
  route: ReturnType<typeof useRoute>,
  router: ReturnType<typeof useRouter>,
  queryKey: string,
  validateFn?: (id: T) => boolean,
) {
  const ids = computed<T[]>(() => {
    const value = route.query[queryKey]
    if (Array.isArray(value))
      return validateFn ? (value as T[]).filter(validateFn) : (value as T[])
    return value ? (value as string).split(',') as T[] : []
  })

  function setId(id: T) {
    if (ids.value.includes(id))
      return

    router.push({
      query: {
        ...route.query,
        [queryKey]: [...ids.value, id],
      },
    })
  }

  function setMultiple(newIds: T[]) {
    router.push({
      query: {
        ...route.query,
        [queryKey]: [...new Set([...ids.value, ...newIds])],
      },
    })
  }

  function removeMultiple(idsToRemove: T[]) {
    router.push({
      query: {
        ...route.query,
        [queryKey]: ids.value.filter(id => !idsToRemove.includes(id)),
      },
    })
  }

  function removeId(id: T) {
    router.push({
      query: {
        ...route.query,
        [queryKey]: ids.value.filter(i => i !== id),
      },
    })
  }

  function toggleId(id: T) {
    if (ids.value.includes(id)) {
      removeId(id)
      return
    }

    setId(id)
  }

  return { ids, removeId, removeMultiple, setId, setMultiple, toggleId }
}

export function useFilter(options: {
  canFilterCategories?: boolean
  canFilterWallets?: boolean
} = {}) {
  const router = useRouter()
  const route = useRoute()
  const categoriesStore = useCategoriesStore()
  const walletsStore = useWalletsStore()
  const canFilterCategories = options.canFilterCategories ?? true
  const canFilterWallets = options.canFilterWallets ?? true

  const wallets = createQueryFilter<WalletId>(route, router, 'filterWallets', id => !!walletsStore.items?.[id])
  const categories = createQueryFilter<CategoryId>(route, router, 'filterCategories', id => !!categoriesStore.items[id])
  const walletsIds = computed(() => canFilterWallets ? wallets.ids.value : [])
  const categoriesIds = computed(() => canFilterCategories ? categories.ids.value : [])

  function clearFilter() {
    router.push({ query: undefined })
  }

  // Atomic apply of both wallet + category selections in a single navigation.
  // Chaining the per-key setters would race: each reads route.query before the
  // previous push lands, so later pushes drop earlier changes.
  function applyFilter(nextWallets: WalletId[], nextCategories: CategoryId[]) {
    router.push({
      query: {
        ...route.query,
        filterCategories: canFilterCategories && nextCategories.length ? nextCategories : undefined,
        filterWallets: canFilterWallets && nextWallets.length ? nextWallets : undefined,
      },
    })
  }

  const isShow = computed(() => categoriesIds.value.length > 0 || walletsIds.value.length > 0)

  return {
    applyFilter,
    canFilterCategories,
    canFilterWallets,
    categoriesIds,
    clearFilter,
    isShow,
    removeCategories: categories.removeMultiple,
    removeCategoryId: categories.removeId,
    removeWalletId: wallets.removeId,
    removeWallets: wallets.removeMultiple,
    setCategories: categories.setMultiple,
    setCategoryId: categories.setId,
    setWallets: wallets.setMultiple,
    toggleCategoryId: categories.toggleId,
    toggleWalletId: wallets.toggleId,
    walletsIds,
  }
}

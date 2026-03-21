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

  return { ids, removeId, setId, setMultiple, toggleId }
}

export function useFilter() {
  const router = useRouter()
  const route = useRoute()
  const categoriesStore = useCategoriesStore()
  const walletsStore = useWalletsStore()

  const wallets = createQueryFilter<WalletId>(route, router, 'filterWallets', id => !!walletsStore.items?.[id])
  const categories = createQueryFilter<CategoryId>(route, router, 'filterCategories', id => !!categoriesStore.items[id])

  function clearFilter() {
    router.push({ query: undefined })
  }

  const isShow = computed(() => categories.ids.value.length > 0 || wallets.ids.value.length > 0)

  return {
    categoriesIds: categories.ids,
    clearFilter,
    isShow,
    removeCategoryId: categories.removeId,
    removeWalletId: wallets.removeId,
    setCategories: categories.setMultiple,
    setCategoryId: categories.setId,
    setWallets: wallets.setMultiple,
    toggleCategoryId: categories.toggleId,
    toggleWalletId: wallets.toggleId,
    walletsIds: wallets.ids,
  }
}

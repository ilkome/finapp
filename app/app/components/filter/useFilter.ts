import type { CategoryId } from '~/components/categories/types'
import type { FilterExtras } from '~/components/filter/extras'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { countActiveExtras, extrasToQuery, parseFilterExtras } from '~/components/filter/extras'
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
  const extras = computed<FilterExtras>(() => parseFilterExtras(route.query))

  // Atomic apply of both wallet + category selections in a single navigation.
  // Chaining the per-key setters would race: each reads route.query before the
  // previous push lands, so later pushes drop earlier changes.
  function applyFilter(next: { categories: CategoryId[], extras: FilterExtras, wallets: WalletId[] }) {
    router.push({
      query: {
        ...route.query,
        ...extrasToQuery(next.extras),
        filterCategories: canFilterCategories && next.categories.length ? next.categories : undefined,
        filterWallets: canFilterWallets && next.wallets.length ? next.wallets : undefined,
      },
    })
  }

  function setExtras(patch: Partial<FilterExtras>) {
    router.push({
      query: {
        ...route.query,
        ...extrasToQuery({ ...extras.value, ...patch }),
      },
    })
  }

  const isShow = computed(() => categoriesIds.value.length > 0 || walletsIds.value.length > 0 || countActiveExtras(extras.value) > 0)

  return {
    applyFilter,
    canFilterCategories,
    canFilterWallets,
    categoriesIds,
    extras,
    isShow,
    removeCategories: categories.removeMultiple,
    removeCategoryId: categories.removeId,
    removeWalletId: wallets.removeId,
    removeWallets: wallets.removeMultiple,
    setCategories: categories.setMultiple,
    setCategoryId: categories.setId,
    setExtras,
    setWallets: wallets.setMultiple,
    toggleCategoryId: categories.toggleId,
    toggleWalletId: wallets.toggleId,
    walletsIds,
  }
}

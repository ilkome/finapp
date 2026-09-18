import type { CategoryId } from '~/components/categories/types'
import type { FilterExtras } from '~/components/filter/extras'
import type { FilterProvider } from '~/components/filter/types'
import type { WalletId } from '~/components/wallets/types'

import { countActiveExtras, defaultFilterExtras, isSameExtras } from '~/components/filter/extras'

/** Staged selection: mutated locally, written to the URL only on apply. */
export function useFilterDraft(filter: FilterProvider) {
  const pendingWallets = ref<WalletId[]>([...filter.walletsIds.value])
  const pendingCategories = ref<CategoryId[]>([...filter.categoriesIds.value])
  const pendingExtras = ref<FilterExtras>({ ...filter.extras.value })

  const hasPending = computed(() =>
    pendingWallets.value.length > 0
    || pendingCategories.value.length > 0
    || countActiveExtras(pendingExtras.value) > 0
    || !isSameExtras(pendingExtras.value, filter.extras.value),
  )

  function toggleWallet(id: WalletId) {
    pendingWallets.value = pendingWallets.value.includes(id)
      ? pendingWallets.value.filter(x => x !== id)
      : [...pendingWallets.value, id]
  }

  function toggleCategory(id: CategoryId) {
    pendingCategories.value = pendingCategories.value.includes(id)
      ? pendingCategories.value.filter(x => x !== id)
      : [...pendingCategories.value, id]
  }

  function apply() {
    filter.applyFilter({
      categories: pendingCategories.value,
      extras: pendingExtras.value,
      wallets: pendingWallets.value,
    })
  }

  function reset() {
    pendingWallets.value = []
    pendingCategories.value = []
    pendingExtras.value = { ...defaultFilterExtras }
    filter.applyFilter({ categories: [], extras: defaultFilterExtras, wallets: [] })
  }

  return { apply, hasPending, pendingCategories, pendingExtras, pendingWallets, reset, toggleCategory, toggleWallet }
}

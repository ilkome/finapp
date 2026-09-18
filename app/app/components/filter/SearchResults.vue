<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { filterKey } from '~/components/filter/injectionKeys'
import { searchCategories, searchWallets } from '~/components/filter/search'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  pendingCategories: CategoryId[]
  pendingWallets: WalletId[]
  searchQuery: string
}>()

const emit = defineEmits<{
  toggleCategory: [id: CategoryId]
  toggleWallet: [id: WalletId]
}>()

const filter = inject(filterKey)!
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()

const wallets = computed(() => filter.canFilterWallets
  ? searchWallets(props.searchQuery, walletsStore.itemsComputed).map(walletId => ({ wallet: walletsStore.itemsComputed[walletId]!, walletId }))
  : [])

const categories = computed(() => filter.canFilterCategories
  ? searchCategories(props.searchQuery, categoriesStore.items, categoriesStore.hasChildren).map((categoryId) => {
      const category = categoriesStore.items[categoryId]!
      return { category, categoryId, parentCategory: categoriesStore.items[category.parentId] }
    })
  : [])
</script>

<template>
  <FilterSearchResultsView
    :categories="categories"
    :pendingCategories="props.pendingCategories"
    :pendingWallets="props.pendingWallets"
    :wallets="wallets"
    @toggleCategory="emit('toggleCategory', $event)"
    @toggleWallet="emit('toggleWallet', $event)"
  />
</template>

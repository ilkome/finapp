<script setup lang="ts">
import type { FilterProvider } from '~/components/filter/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { getStyles } from '~/components/ui/getStyles'

const filter = inject('filter') as FilterProvider
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const itemClasses = getStyles('item', ['alt', 'rounded'])
</script>

<template>
  <div class="flex gap-2">
    <!-- Categories -->
    <WalletsItem
      v-for="walletId in filter?.walletsIds?.value"
      :key="walletId"
      :class="itemClasses"
      :walletId="walletId"
      :wallet="walletsStore.sortedItems[walletId]"
      alt
      @click="filter.removeWalletId(walletId)"
    />

    <CategoriesItem
      v-for="categoryId in filter?.catsIds?.value"
      :key="categoryId"
      :category="categoriesStore.items[categoryId]"
      :categoryId="categoryId"
      :class="itemClasses"
      isHideDots
      @click="filter.removeCategoryId(categoryId)"
    />
  </div>
</template>

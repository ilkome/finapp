<script setup lang="ts">
import type { FilterProvider } from '~/components/filter/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { getStyles } from '~/components/ui/getStyles'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  isShowCategories?: boolean
  isShowWallets?: boolean
}>()

const filter = inject('filter') as FilterProvider
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const itemClasses = getStyles('item', ['alt', 'rounded'])
</script>

<template>
  <div class="flex gap-2 overflow-hidden overflow-x-auto">
    <!-- Wallets -->
    <template v-if="props.isShowWallets">
      <WalletsItem
        v-for="walletId in filter?.walletsIds?.value"
        :key="walletId"
        :class="itemClasses"
        :walletId="walletId"
        :wallet="walletsStore.itemsComputed[walletId]"
        insideClasses="!min-h-[38px]"
        alt
        @click="filter.removeWalletId(walletId)"
      />
    </template>

    <!-- Categories -->
    <template v-if="props.isShowCategories">
      <CategoriesItem
        v-for="categoryId in filter?.categoriesIds?.value"
        :key="categoryId"
        :category="categoriesStore.items[categoryId]"
        :categoryId="categoryId"
        :class="itemClasses"
        alt
        isShowDots
        insideClasses="!min-h-[38px]"
        @click="filter.removeCategoryId(categoryId)"
      />
    </template>
  </div>
</template>

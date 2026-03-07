<script setup lang="ts">
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { filterKey } from '~/components/stat/injectionKeys'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  isShowCategories?: boolean
  isShowWallets?: boolean
}>()

const filter = inject(filterKey)!
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const itemClasses = 'bg-item-3 rounded-sm'
</script>

<template>
  <div class="flex gap-2">
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
        isShowCreditLimit
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
        insideClasses="!min-h-[38px]"
        @click="filter.removeCategoryId(categoryId)"
      />
    </template>
  </div>
</template>

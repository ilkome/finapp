<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { filterKey } from '~/components/filter/injectionKeys'
import { useFilterSummary } from '~/components/filter/useFilterSummary'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  isShowCategories?: boolean
  isShowWallets?: boolean
}>()

const filter = inject(filterKey)!
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const { displayCategoryIds } = useFilterSummary()
const itemClasses = 'bg-elevated/30 rounded-sm shrink-0'

function onCategoryClick(categoryId: CategoryId) {
  const children = categoriesStore.getChildrenIds(categoryId)
  const selected = filter?.categoriesIds?.value ?? []

  if (children.length && children.every(id => selected.includes(id)))
    filter.removeCategories(children)
  else
    filter.removeCategoryId(categoryId)
}
</script>

<template>
  <div class="flex shrink-0 gap-2">
    <template v-if="props.isShowWallets">
      <WalletsItem
        v-for="walletId in filter?.walletsIds?.value"
        :key="walletId"
        :class="itemClasses"
        :walletId="walletId"
        :wallet="walletsStore.itemsComputed[walletId]!"
        insideClasses="min-h-9.5!"
        compact
        isShowIcon
        isShowCreditLimit
        @click="filter.removeWalletId(walletId)"
      />
    </template>

    <template v-if="props.isShowCategories">
      <CategoriesItem
        v-for="categoryId in displayCategoryIds"
        :key="categoryId"
        :category="categoriesStore.items[categoryId]!"
        :categoryId="categoryId"
        :class="itemClasses"
        stacked
        insideClasses="min-h-9.5!"
        @click="onCategoryClick(categoryId)"
      />
    </template>
  </div>
</template>

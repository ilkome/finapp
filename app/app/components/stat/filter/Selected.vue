<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

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
const itemClasses = 'bg-elevated/30 rounded-sm shrink-0'

const displayCategoryIds = computed<CategoryId[]>(() => {
  const selected = new Set(filter?.categoriesIds?.value ?? [])
  if (!selected.size)
    return []

  const consumed = new Set<CategoryId>()
  const result: CategoryId[] = []

  for (const rootId of categoriesStore.categoriesRootIds) {
    const children = categoriesStore.getChildrenIds(rootId)
    if (!children.length)
      continue

    if (children.every(id => selected.has(id))) {
      result.push(rootId)
      children.forEach(id => consumed.add(id))
    }
  }

  for (const id of (filter?.categoriesIds?.value ?? [])) {
    if (!consumed.has(id))
      result.push(id)
  }

  return result
})

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
        insideClasses="!min-h-[38px]"
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
        insideClasses="!min-h-[38px]"
        @click="onCategoryClick(categoryId)"
      />
    </template>
  </div>
</template>

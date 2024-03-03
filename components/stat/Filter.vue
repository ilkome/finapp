<script setup lang="ts">
import { useCategoriesStore } from '~/components/categories/useCategories';
import { useFilter } from '~/components/filter/useFilter';
import { useWalletsStore } from '~/components/wallets/useWalletsStore';

const filterStore = useFilter()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()

const filterWalletsItems = computed(() =>
  filterStore.walletsIds.reduce((acc, id) => {
    acc[id] = walletsStore.items[id]
    return acc
  }, {}),
)

const filterCategoriesItems = computed(() =>
  filterStore.catsIds.reduce((acc, id) => {
    acc[id] = categoriesStore.items[id]
    return acc
  }, {}),
)

const isShowCategorySelector = ref(false)
</script>

<template lang="pug">
.flex.flex-col.gap-2(v-if="filterCategoriesItems || filterWalletsItems")
  UiTitle {{ $t('base.filter') }}

  FilterRow
    template(#add)
      FilterAddItem(
        :isShowText="filterStore.catsIds.length === 0"
        @click="isShowCategorySelector = true"
      )

    template(#content)
      FilterWalletItem(
        v-if="filterWalletsItems"
        v-for="(walletItem, walletId) in filterWalletsItems"
        :key="walletId"
        :id="walletId"
        @click="filterStore.removeWalletId(walletId)"
      )

      FilterCategoryItem(
        v-if="filterStore.catsIds"
        v-for="categoryId in filterStore.catsIds"
        :key="categoryId"
        :categoryId="categoryId"
        @click="filterStore.removeCategoryId(categoryId)"
      )
      FilterItemBg(@click="filterStore.clearFilter")
        .mdi.mdi-filter-remove-outline.text-2xl

  CategoriesSelector(
    :isShow="isShowCategorySelector"
    isAllowSelectParentCategory
    @show="value => isShowCategorySelector = value"
    @onSelected="filterStore.setCategoryId"
  )
</template>

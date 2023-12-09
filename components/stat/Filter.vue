<script setup lang="ts">
import useFilter from '~/components/filter/useFilter'

const { $store } = useNuxtApp()
const { setFilterCatsId, removeFilterCategoryId, clearFilter } = useFilter()

const filterWalletsItems = computed(() =>
  $store.state.filter.walletsIds.reduce((acc, id) => {
    acc[id] = $store.state.wallets.items[id]
    return acc
  }, {}),
)

const filterCategoriesItems = computed(() =>
  $store.state.filter.catsIds.reduce((acc, id) => {
    acc[id] = $store.state.categories.items[id]
    return acc
  }, {}),
)

const isShowCategorySelector = ref(false)
</script>

<template lang="pug">
.flex.flex-col.gap-2(v-if="filterCategoriesItems || filterWalletsItems")
  UiTitle {{ $t('base.filter') }}

  //- Category
  FilterRow
    template(#add)
      FilterAddItem(
        :isShowText="$store.state.filter.catsIds.length === 0"
        @click="isShowCategorySelector = true"
      )
    template(#content)
      FilterWalletItem(
        v-if="filterWalletsItems"
        v-for="(walletItem, walletId) in filterWalletsItems"
        :key="walletId"
        :id="walletId"
        @click="$store.commit('filter/removeFilterWalletId', walletId)"
      )
      FilterCategoryItem(
        v-if="$store.state.filter.catsIds"
        v-for="categoryId in $store.state.filter.catsIds"
        :key="categoryId"
        :categoryId="categoryId"
        @click="removeFilterCategoryId"
      )
      FilterItemBg(@click="clearFilter")
        .mdi.mdi-filter-remove-outline.text-2xl

  CategoriesSelector(
    :isShow="isShowCategorySelector"
    isAllowSelectParentCategory
    @show="value => isShowCategorySelector = value"
    @onSelected="setFilterCatsId"
  )
</template>

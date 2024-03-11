<script setup lang="ts">
import { useCategoriesStore } from "~/components/categories/useCategories";
import { useFilter } from "~/components/filter/useFilter";
import { useWalletsStore } from "~/components/wallets/useWalletsStore";
import type { Wallets } from "~/components/wallets/types";

const filterStore = useFilter();
const walletsStore = useWalletsStore();
const categoriesStore = useCategoriesStore();

const filterWalletsItems = computed(() =>
  filterStore.walletsIds.reduce((acc, id) => {
    acc[id] = walletsStore.items[id];
    return acc;
  }, {} as Wallets),
);

const filterCategoriesItems = computed(() =>
  filterStore.catsIds.reduce((acc, id) => {
    acc[id] = categoriesStore.items[id];
    return acc;
  }, {} as Wallets),
);

const isShowCategorySelector = ref(false);
const isShownWalletsSelector = ref(false);
</script>

<template lang="pug">
.flex.flex-col.gap-2.px-2(v-if="filterCategoriesItems || filterWalletsItems")
  UiTitle {{ $t('base.filter') }}

  FilterRow
    template(#add)
      .flex.gap-3
        FilterAddItem(@click="isShowCategorySelector = true")
          template(#icon)
            UiIconCategory.size-6
          template(
            v-if="filterStore.catsIds.length === 0"
            name="text"
          ) {{ $t('categories.createNewTitle') }}

        FilterAddItem(@click="isShownWalletsSelector = true")
          template(#icon)
            UiIconWallet.size-6

    template(#content)
      FilterWalletItem(
        v-if="filterWalletsItems"
        v-for="(_, walletId) in filterWalletsItems"
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
    @onClose="isShowCategorySelector = false"
    @onSelected="filterStore.setCategoryId"
  )

  WalletsSelector(
    v-if="isShownWalletsSelector"
    :title="$t('wallets.title')"
    @onClose="isShownWalletsSelector = false"
    @onSelected="filterStore.setWalletId"
  )
</template>

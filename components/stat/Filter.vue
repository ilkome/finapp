<script setup lang="ts">
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useFilter } from '~/components/filter/useFilter'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import type { Wallets } from '~/components/wallets/types'

const filterStore = useFilter()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()

const filterWalletsItems = computed(() =>
  filterStore.walletsIds.reduce((acc, id) => {
    acc[id] = walletsStore.items[id]
    return acc
  }, {} as Wallets),
)

const filterCategoriesItems = computed(() =>
  filterStore.catsIds.reduce((acc, id) => {
    acc[id] = categoriesStore.items[id]
    return acc
  }, {} as Wallets),
)

const isShowCategorySelector = ref(false)
const isShownWalletsSelector = ref(false)
</script>

<template>
  <div>
    <FilterRow>
      <template #add>
        <div class="flex gap-3 h-10">
          <FilterAddItem @click="isShowCategorySelector = true">
            <template #icon>
              <UiIconCategory class="size-6" />
            </template>
            <template v-if="filterStore.catsIds.length === 0" name="text">
              {{ $t("categories.createNewTitle") }}
            </template>
          </FilterAddItem>

          <FilterAddItem @click="isShownWalletsSelector = true">
            <template #icon>
              <UiIconWallet class="size-6" />
            </template>
          </FilterAddItem>
        </div>
      </template>

      <template #content>
        <FilterWalletItem
          v-for="(_, walletId) in filterWalletsItems"
          v-if="filterWalletsItems"
          :id="walletId"
          :key="walletId"
          @click="filterStore.removeWalletId(walletId)"
        />

        <FilterCategoryItem
          v-for="categoryId in filterStore.catsIds"
          v-if="filterStore.catsIds"
          :key="categoryId"
          :categoryId="categoryId"
          @click="filterStore.removeCategoryId(categoryId)"
        />

        <FilterItemBg v-if="filterStore.isShow" @click="filterStore.clearFilter">
          <div class="mdi mdi-filter-remove-outline text-2xl" />
        </FilterItemBg>
      </template>
    </FilterRow>

    <CategoriesSelector
      :isShow="isShowCategorySelector"
      isAllowSelectParentCategory
      @onClose="isShowCategorySelector = false"
      @onSelected="filterStore.setCategoryId"
    />

    <WalletsSelector
      v-if="isShownWalletsSelector"
      :title="$t('wallets.title')"
      @onClose="isShownWalletsSelector = false"
      @onSelected="filterStore.setWalletId"
    />
  </div>
</template>

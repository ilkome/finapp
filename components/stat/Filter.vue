<script setup lang="ts">
import { useFilter } from '~/components/filter/useFilter'

const filterStore = useFilter()

const isShowCategorySelector = ref(false)
const isShownWalletsSelector = ref(false)
</script>

<template>
  <div>
    <FilterRow>
      <template #add>
        <div class="flex h-10 gap-0">
          <FilterAddItem @click="isShowCategorySelector = true">
            <template #icon>
              <UiIconCategory class="size-6" />
            </template>
            <template v-if="filterStore.catsIds.length === 0">
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
          v-for="walletId in filterStore.walletsIds"
          :id="walletId"
          :key="walletId"
          @click="filterStore.removeWalletId(walletId)"
        />

        <FilterCategoryItem
          v-for="categoryId in filterStore.catsIds"
          :key="categoryId"
          :categoryId="categoryId"
          @click="filterStore.removeCategoryId(categoryId)"
        />

        <FilterItemBg
          v-if="filterStore.isShow"
          @click="filterStore.clearFilter"
        >
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

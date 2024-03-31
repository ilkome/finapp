<script setup lang="ts">
import type { PeriodProvider } from '~/components/dashboard/Page.vue'

const period = inject('period') as PeriodProvider

const isShowCategorySelector = ref(false)
const isShownWalletsSelector = ref(false)
</script>

<template>
  <div v-if="period.isShow.value">
    <FilterRow>
      <template #content>
        <div class="flex">
          <FilterAddItem @click="isShowCategorySelector = true">
            <template #icon>
              <UiIconCategory class="size-6" />
            </template>
            <template v-if="period.catsIds.value.length === 0">
              {{ $t("categories.createNewTitle") }}
            </template>
          </FilterAddItem>
          <FilterCategoryItem
            v-for="categoryId in period.catsIds.value"
            :key="categoryId"
            :categoryId="categoryId"
            @click="period.removeCategoryId(categoryId)"
          />
        </div>

        <div class="flex">
          <FilterAddItem @click="isShownWalletsSelector = true">
            <template #icon>
              <UiIconWallet class="size-6" />
            </template>
          </FilterAddItem>
          <FilterWalletItem
            v-for="walletId in period.walletsIds.value"
            :id="walletId"
            :key="walletId"
            @click="period.removeWalletId(walletId)"
          />
        </div>

        <FilterItemBg
          v-if="period.isShow"
          @click="period.clearFilter"
        >
          <div class="mdi mdi-filter-remove-outline text-xl" />
        </FilterItemBg>
      </template>
    </FilterRow>

    <CategoriesSelector
      :isShow="isShowCategorySelector"
      isAllowSelectParentCategory
      @onClose="isShowCategorySelector = false"
      @onSelected="period.setCategoryId"
    />

    <WalletsSelector
      v-if="isShownWalletsSelector"
      :title="$t('wallets.title')"
      @onClose="isShownWalletsSelector = false"
      @onSelected="period.setWalletId"
    />
  </div>
</template>

<script setup lang="ts">
import type { FilterProvider } from '~/components/filter/useFilter'

const filter = inject('filter') as FilterProvider

const isShowCategorySelector = ref(false)
</script>

<template>
  <div>
    <FilterRow>
      <template #content>
        <div class="flex bg-item-4 rounded-lg">
          <FilterAddItem @click="isShowCategorySelector = true">
            <template #icon>
              <UiIconCategory class="size-6" />
            </template>
            <template v-if="filter.catsIds.value.length === 0">
              {{ $t("categories.createNewTitle") }}
            </template>
          </FilterAddItem>

          <FilterCategoryItem
            v-for="categoryId in filter.catsIds.value"
            :key="categoryId"
            :categoryId="categoryId"
            @click="filter.removeCategoryId(categoryId)"
          />
        </div>

        <div class="flex bg-item-4 rounded-lg">
          <VDropdown>
            <FilterAddItem @click="() => {}">
              <template #icon>
                <UiIconWallet class="size-6" />
              </template>
            </FilterAddItem>

            <template #popper="{ hide }">
              <WalletsSelector2
                :hide="hide"
                :selected="filter.walletsIds"
                @onSelected="filter.toggleWalletId"
              />
            </template>
          </VDropdown>

          <FilterWalletItem
            v-for="walletId in filter.walletsIds.value"
            :id="walletId"
            :key="walletId"
            @click="filter.removeWalletId(walletId)"
          />
        </div>

        <FilterItemBg
          v-if="filter.isShow.value"
          class="bg-transparent"
          @click="filter.clearFilter"
        >
          <div class="mdi mdi-filter-remove-outline text-xl" />
        </FilterItemBg>
      </template>
    </FilterRow>

    <CategoriesSelector
      :isShow="isShowCategorySelector"
      isAllowSelectParentCategory
      @onClose="isShowCategorySelector = false"
      @onSelected="filter.setCategoryId"
    />
  </div>
</template>

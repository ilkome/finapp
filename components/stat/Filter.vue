<script setup lang="ts">
import type { FilterProvider } from '~/components/filter/useFilter'

const filter = inject('filter') as FilterProvider

const isShowCategorySelector = ref(false)
</script>

<template>
  <div>
    <FilterRow>
      <template #content>
        <!-- Categories -->
        <div class="flex bg-item-4 rounded-lg">
          <VDropdown>
            <FilterAddItem>
              <template #icon>
                <UiIconCategory class="size-6" />
              </template>
            </FilterAddItem>

            <template #popper>
              <CategoriesSelector
                isAllowSelectParentCategory
                @onSelected="filter.setCategoryId"
              />
            </template>
          </VDropdown>

          <FilterCategoryItem
            v-for="categoryId in filter.catsIds.value"
            :key="categoryId"
            :categoryId="categoryId"
            @click="filter.removeCategoryId(categoryId)"
          />
        </div>

        <!-- Wallets -->
        <div class="flex bg-item-4 rounded-lg">
          <VDropdown>
            <FilterAddItem>
              <template #icon>
                <UiIconWallet class="size-6" />
              </template>
            </FilterAddItem>

            <template #popper>
              <WalletsSelector
                :selected="filter.walletsIds"
                @onSelected="filter.toggleWalletId"
              />
            </template>
          </VDropdown>

          <FilterWalletItem
            v-for="walletId in filter.walletsIds.value"
            :key="walletId"
            :walletId
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
  </div>
</template>

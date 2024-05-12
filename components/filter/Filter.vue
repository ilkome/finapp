<script setup lang="ts">
import type { FilterProvider } from '~/components/filter/useFilter'
import { getStyles } from '~/components/ui/getStyles'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const filter = inject('filter') as FilterProvider
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()

const itemAddClasses = getStyles('item', ['link', 'minw1', 'center', 'rounded', 'padding2', 'minh'])
</script>

<template>
  <div class="grid gap-3 overflow-hidden grid-cols-[auto,fr]">
    <div class="flex flex-wrap gap-3 overflow-hidden overflow-x-auto">
      <!-- Categories -->
      <div class="flex bg-item-4 rounded-lg">
        <VDropdown
          :overflowPadding="12"
          autoBoundaryMaxSize
          placement="top-start"
        >
          <div :class="itemAddClasses">
            <UiIconCategory class="size-6" />
          </div>

          <template #popper="{ hide }">
            <!-- TODO: combine -->
            <div class="flex items-center px-3 h-12">
              <UiTitle>{{ $t('categories.title') }}</UiTitle>
              <BaseBottomSheetClose @onClick="hide" />
            </div>

            <CategoriesSelector
              @onSelected="filter.toggleCategoryId"
              @filter="filter.toggleCategoryId"
            />
          </template>
        </VDropdown>

        <CategoriesItem
          v-for="categoryId in filter.catsIds.value"
          :key="categoryId"
          :category="categoriesStore.items[categoryId]"
          :categoryId="categoryId"
          alt
          @click="filter.removeCategoryId(categoryId)"
        />
      </div>

      <!-- Wallets -->
      <div class="flex bg-item-4 rounded-lg">
        <VDropdown
          :overflowPadding="12"
          autoBoundaryMaxSize
          placement="top-start"
        >
          <div :class="itemAddClasses">
            <UiIconWallet class="size-6" />
          </div>

          <template #popper="{ hide }">
            <!-- TODO: combine -->
            <div class="flex items-center px-3 h-12">
              <UiTitle>{{ $t('wallets.title') }}</UiTitle>
              <BaseBottomSheetClose @onClick="hide" />
            </div>

            <WalletsSelector
              class="max-h-[50vh] _w-[90vw] min-w-[260px]"
              :selected="filter.walletsIds"
              @onSelected="filter.toggleWalletId"
            />
          </template>
        </VDropdown>

        <WalletsItem
          v-for="walletId in filter.walletsIds.value"
          :key="walletId"
          :walletId="walletId"
          :wallet="walletsStore.sortedItems[walletId]"
          alt
          @click="filter.removeWalletId(walletId)"
        />
      </div>

      <div
        v-if="filter.isShow.value"
        :class="getStyles('item', ['link', 'minw1', 'center', 'rounded', 'padding2', 'minh'])"
        class="bg-transparent"
        @click="filter.clearFilter"
      >
        <div class="mdi mdi-filter-remove-outline text-xl" />
      </div>
    </div>
  </div>
</template>

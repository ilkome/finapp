<script setup lang="ts">
import type { FilterProvider } from '~/components/filter/types'
import { getStyles } from '~/components/ui/getStyles'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const filter = inject('filter') as FilterProvider
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()

const itemAddClasses = getStyles('item', ['link', 'minw1', 'center', 'rounded', 'padding2', 'minh2'])
</script>

<template>
  <div class="flex gap-1">
    <!-- Categories -->
    <div class="flex bg-item-4 rounded-lg">
      <VDropdown
        :overflowPadding="12"
        autoBoundaryMaxSize
        placement="top-start"
      >
        <div :class="itemAddClasses" class="justify-center">
          <UiIconCategory class="size-5" />
        </div>

        <template #popper="{ hide }">
          <!-- TODO: combine -->
          <div class="flex items-center px-3 h-12">
            <UiTitle>{{ $t('categories.title') }}</UiTitle>
            <BaseBottomSheetClose @onClick="hide" />
          </div>

          <CategoriesSelector
            class="min-w-72 max-w-xs"
            @onSelected="filter.toggleCategoryId"
            @filter="filter.toggleCategoryId"
          />
        </template>
      </VDropdown>

      <CategoriesItem
        v-for="categoryId in filter?.catsIds?.value"
        :key="categoryId"
        :category="categoriesStore.items[categoryId]"
        :categoryId="categoryId"
        isHideDots
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
        <div :class="itemAddClasses" class="justify-center">
          <UiIconWallet class="size-5" />
        </div>

        <template #popper="{ hide }">
          <!-- TODO: combine -->
          <div class="flex items-center px-3 h-12">
            <UiTitle>{{ $t('wallets.title') }}</UiTitle>
            <BaseBottomSheetClose @onClick="hide" />
          </div>

          <!-- TODO: fix for Arrays -->
          <WalletsSelector
            class="min-w-72 max-w-xs"
            :activeItemId="filter?.walletsIds.value[0]"
            @onSelected="filter.toggleWalletId"
          />
        </template>
      </VDropdown>

      <WalletsItem
        v-for="walletId in filter?.walletsIds?.value"
        :key="walletId"
        :walletId="walletId"
        :wallet="walletsStore.sortedItems[walletId]"
        alt
        @click="filter.removeWalletId(walletId)"
      />
    </div>

    <div
      v-if="filter?.isShow?.value"
      :class="getStyles('item', ['link', 'minw1', 'center', 'rounded', 'padding2', 'minh2'])"
      class="bg-transparent"
      @click="filter.clearFilter"
    >
      <div class="mdi mdi-filter-remove-outline text-xl" />
    </div>
  </div>
</template>

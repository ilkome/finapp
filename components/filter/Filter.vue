<script setup lang="ts">
import type { FilterProvider } from '~/components/filter/useFilter'
import { getStyles } from '~/components/ui/getStyles'

const filter = inject('filter') as FilterProvider

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
              isAllowSelectParentCategory
              @onSelected="filter.toggleCategoryId"
              @filter="filter.toggleCategoryId"
            />
          </template>
        </VDropdown>

        <CategoriesItem2
          v-for="categoryId in filter.catsIds.value"
          :key="categoryId"
          :categoryId="categoryId"
          @click="filter.removeCategoryId(categoryId)"
        />
      </div>

      <!-- Wallets -->
      <div class="flex bg-item-4 rounded-lg">
        <VDropdown
          :overflowPadding="12"
          autoBoundaryMaxSize
        >
          <div :class="itemAddClasses">
            <UiIconWallet class="size-6" />
          </div>

          <template #popper>
            <WalletsSelector
              :selected="filter.walletsIds"
              @onSelected="filter.toggleWalletId"
            />
          </template>
        </VDropdown>

        <WalletsItem2
          v-for="walletId in filter.walletsIds.value"
          :key="walletId"
          :walletId
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

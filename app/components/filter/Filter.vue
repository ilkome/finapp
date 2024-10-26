<script setup lang="ts">
import type { FilterProvider } from '~/components/filter/types'
import { getStyles } from '~/components/ui/getStyles'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = withDefaults(defineProps<{
  isHideWallets?: boolean
}>(), {
  isHideWallets: false,
})

const filter = inject('filter') as FilterProvider
const { t } = useI18n()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()

const itemAddClasses = getStyles('item', ['link', 'minw1', 'center', 'rounded', 'padding2', 'minh2'])
</script>

<template>
  <div class="flex gap-1">
    <!-- Categories -->
    <div class="flex bg-item-4 rounded-lg">
      <UPopover>
        <div :class="itemAddClasses" class="justify-center">
          <UiIconCategory class="size-5" />
        </div>

        <template #panel="{ close }">
          <UiPopoverWrap
            :title="t('categories.title')"
            @close="close"
          >
            <CategoriesSelector
              class="min-w-72 max-w-xs"
              @onSelected="filter.toggleCategoryId"
              @filter="filter.toggleCategoryId"
            />
          </UiPopoverWrap>
        </template>
      </UPopover>

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
    <div
      v-if="!props.isHideWallets"
      class="flex bg-item-4 rounded-lg"
    >
      <UPopover>
        <div :class="itemAddClasses" class="justify-center">
          <UiIconWallet class="size-5" />
        </div>

        <template #panel="{ close }">
          <UiPopoverWrap
            :title="t('wallets.title')"
            @close="close"
          >
            <WalletsSelector
              class="min-w-72 max-w-xs"
              :activeItemId="filter?.walletsIds.value[0]"
              @onSelected="filter.toggleWalletId"
            />
          </UiPopoverWrap>
        </template>
      </UPopover>

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

<script setup lang="ts">
import type { FilterProvider } from '~/components/filter/types'

const props = defineProps<{
  isShowCategories?: boolean
  isShowWallets?: boolean
}>()

const filter = inject('filter') as FilterProvider
const { t } = useI18n()

const modals = ref({
  categories: false,
  wallets: false,
})
</script>

<template>
  <div class="flex">
    <BottomSheetOrDropdown
      v-if="props.isShowCategories"
      :title="t('categories.title')"
      :isOpen="modals.categories"
      isShowCloseBtn
      @onOpenModal="modals.categories = true"
      @onCloseModal="modals.categories = false"
    >
      <template #trigger>
        <UiItem1>
          <Icon name="hugeicons:folder-library" size="20" />
        </UiItem1>
      </template>

      <template #custom="{ close }">
        <div class="grid grid-rows-[1fr_auto] h-full overflow-hidden max-h-[60dvh]">
          <div class="overflow-y-auto scrollerBlock">
            <CategoriesSelector
              :selectedIds="filter?.categoriesIds.value"
              class="min-w-80 px-3"
              @filter="filter.toggleCategoryId"
              @onSelected="filter.toggleCategoryId"
              @setCategories="filter.setCategories"
            />
          </div>

          <div class="px-3 py-2">
            <UiButtonAccent @click="close">
              {{ t('base.apply') }}
            </UiButtonAccent>
          </div>
        </div>
      </template>
    </BottomSheetOrDropdown>

    <BottomSheetOrDropdown
      v-if="props.isShowWallets"
      :title="t('wallets.title')"
      :isOpen="modals.wallets"
      isShowCloseBtn
      @onOpenModal="modals.wallets = true"
      @onCloseModal="modals.wallets = false"
    >
      <template #trigger>
        <UiItem1>
          <Icon name="hugeicons:wallet-01" size="20" />
        </UiItem1>
      </template>

      <template #custom="{ close }">
        <div class="grid grid-rows-[1fr_auto] h-full overflow-hidden max-h-[60dvh]">
          <WalletsSelector
            :selectedIds="filter?.walletsIds.value"
            class="min-w-80 px-3"
            @onSelected="filter.toggleWalletId"
          />

          <div class="px-3 py-2">
            <UiButtonAccent @click="close">
              {{ t('base.apply') }}
            </UiButtonAccent>
          </div>
        </div>
      </template>
    </BottomSheetOrDropdown>
  </div>
</template>

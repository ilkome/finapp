<script setup lang="ts">
import type { FilterProvider } from '~/components/stat/filter/types'

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
  <div class="flex gap-1">
    <BottomSheetOrDropdown
      v-if="props.isShowWallets"
      :title="t('wallets.filter')"
      :isOpen="modals.wallets"
      isShowCloseBtn
      @onOpenModal="modals.wallets = true"
      @onCloseModal="modals.wallets = false"
    >
      <template #trigger>
        <UTooltip :text="t('wallets.filter')">
          <UChip
            :show="filter?.walletsIds.value.length > 0"
            color="secondary"
            inset
            size="xs"
          >
            <UButton
              :aria-label="t('wallets.filter')"
              class="text-muted"
              color="neutral"
              icon="hugeicons:wallet-01"
              size="lg"
              square
              variant="ghost"
            />
          </UChip>
        </UTooltip>
      </template>

      <template #custom="{ close }">
        <div class="grid h-full max-h-[60dvh] grid-rows-[1fr_auto] overflow-hidden">
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

    <BottomSheetOrDropdown
      v-if="props.isShowCategories"
      :title="t('categories.filter')"
      :isOpen="modals.categories"
      isShowCloseBtn
      @onOpenModal="modals.categories = true"
      @onCloseModal="modals.categories = false"
    >
      <template #trigger>
        <UTooltip :text="t('categories.filter')">
          <UChip
            :show="filter?.categoriesIds.value.length > 0"
            color="secondary"
            inset
            size="xs"
          >
            <UButton
              :aria-label="t('categories.filter')"
              class="text-muted"
              color="neutral"
              icon="hugeicons:folder-library"
              size="lg"
              square
              variant="ghost"
            />
          </UChip>
        </UTooltip>
      </template>

      <template #custom="{ close }">
        <div class="grid h-full max-h-[60dvh] grid-rows-[1fr_auto] overflow-hidden">
          <div class="scrollerBlock overflow-y-auto">
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
              {{ t('base.close') }}
            </UiButtonAccent>
          </div>
        </div>
      </template>
    </BottomSheetOrDropdown>
  </div>
</template>

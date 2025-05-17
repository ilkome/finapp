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
  <div class="flex gap-1">
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
          <UButton
            :aria-label="t('categories.filter')"
            class="text-muted"
            color="neutral"
            icon="hugeicons:folder-library"
            size="lg"
            square
            variant="ghost"
          />
        </UTooltip>
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
              {{ t('base.close') }}
            </UiButtonAccent>
          </div>
        </div>
      </template>
    </BottomSheetOrDropdown>

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
          <UButton
            :aria-label="t('wallets.filter')"
            class="text-muted"
            color="neutral"
            icon="hugeicons:wallet-01"
            size="lg"
            square
            variant="ghost"
          />
        </UTooltip>
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

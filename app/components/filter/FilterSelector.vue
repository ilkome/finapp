<script setup lang="ts">
import type { FilterProvider } from '~/components/filter/types'
import { getStyles } from '~/components/ui/getStyles'

const props = withDefaults(defineProps<{
  isHideWallets?: boolean
}>(), {
  isHideWallets: false,
})

const filter = inject('filter') as FilterProvider
const { t } = useI18n()

const itemAddClasses = getStyles('item', ['link', 'minw1', 'center', 'rounded', 'padding2', 'minh2'])
</script>

<template>
  <div class="grid gap-2">
    <div class="flex gap-1">
      <!-- Categories -->
      <div class="bg-item-4 flex rounded-lg">
        <UPopover>
          <UiItem3>
            <UiIconCategory class="size-5" />
          </UiItem3>

          <template #panel="{ close }">
            <UiPopoverWrap
              :title="t('categories.title')"
              @close="close"
            >
              <CategoriesSelector
                class="min-w-72 max-w-xs"
                :selectedIds="filter?.catsIds.value"
                @onSelected="filter.toggleCategoryId"
                @filter="filter.toggleCategoryId"
              />
            </UiPopoverWrap>
          </template>
        </UPopover>
      </div>

      <!-- Wallets -->
      <div
        v-if="!props.isHideWallets"
        class="bg-item-4 flex rounded-lg"
      >
        <UPopover>
          <UiItem3>
            <UiIconWallet class="size-5" />
          </UiItem3>

          <template #panel="{ close }">
            <UiPopoverWrap
              :title="t('wallets.title')"
              @close="close"
            >
              <WalletsSelector
                class="min-w-72 max-w-xs"
                :selectedIds="filter?.walletsIds.value"
                @onSelected="filter.toggleWalletId"
              />
            </UiPopoverWrap>
          </template>
        </UPopover>
      </div>

      <UiItem3
        v-if="filter?.isShow?.value"
        class="bg-item-4 justify-center"
        :class="itemAddClasses"
        @click="filter.clearFilter"
      >
        <Icon name="lucide:delete" size="20" />
      </UiItem3>
    </div>
  </div>
</template>

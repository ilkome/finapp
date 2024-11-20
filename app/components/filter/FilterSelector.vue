<script setup lang="ts">
import { usePointer, useWindowSize } from '@vueuse/core'
import type { FilterProvider } from '~/components/filter/types'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  isShowCategories?: boolean
  isShowWallets?: boolean
}>()

const filter = inject('filter') as FilterProvider
const { t } = useI18n()
const { width } = useWindowSize()
const { pointerType } = usePointer()
const isLaptop = computed(() => width.value >= 766 && pointerType.value === 'mouse')

const itemAddClasses = getStyles('item', ['link', 'minw1', 'center', 'rounded', 'padding2', 'minh2'])

const modals = ref({
  categories: false,
  wallets: false,
})
</script>

<template>
  <div class="flex gap-1">
    <template v-if=" props.isShowCategories">
      <!-- Categories -->
      <UPopover v-if="isLaptop">
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
              @setCategories="filter.setCategories"
              @filter="filter.toggleCategoryId"
            />
          </UiPopoverWrap>
        </template>
      </UPopover>

      <!-- Mobile -->
      <template v-else>
        <UiItem3
          @click="modals.categories = true"
        >
          <UiIconCategory class="size-5" />
        </UiItem3>

        <Teleport to="body">
          <BaseBottomSheet2
            v-if="modals.categories"
            isShow
            drugClassesCustom="max-w-md bg-foreground-1 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 rounded-xl"
            @closed="modals.categories = false"
          >
            <template #handler="{ close }">
              <div class="relative z-20">
                <BaseBottomSheetHandler />
                <BaseBottomSheetClose @onClick="close" />
              </div>
            </template>

            <template #default="{ close }">
              <div class="bg-foreground-1 grid h-full max-h-[70vh] grid-rows-[auto,1fr,auto] overflow-hidden pt-1">
                <UiTitle9 class="!px-4 !py-2">
                  {{ t("dates.select") }}
                </UiTitle9>

                <div class="scrollerBlock grid h-full grid-rows-[auto,1fr] gap-1 overflow-hidden overflow-y-auto px-1">
                  <CategoriesSelector
                    :selectedIds="filter?.catsIds.value"
                    @onSelected="filter.toggleCategoryId"
                    @filter="filter.toggleCategoryId"
                  />
                </div>
                <div class="flex-center px-3 py-2">
                  <UiButtonBlue
                    rounded
                    @click="close"
                  >
                    {{ t("base.save") }}
                  </UiButtonBlue>
                </div>
              </div>
            </template>
          </BaseBottomSheet2>
        </Teleport>
      </template>
    </template>

    <!-- Wallets -->
    <template v-if=" props.isShowWallets">
      <UPopover v-if="isLaptop">
        <UiItem3>
          <UiIconWallet class="size-5" />
        </UiItem3>

        <template #panel="{ close }">
          <UiPopoverWrap
            :title="t('wallets.title')"
            @close="close"
          >
            <WalletsSelector
              :selectedIds="filter?.walletsIds.value"
              class="min-w-72 max-w-xs"
              @onSelected="filter.toggleWalletId"
            />
          </UiPopoverWrap>
        </template>
      </UPopover>

      <!-- Mobile -->
      <template v-else>
        <UiItem3
          @click="modals.wallets = true"
        >
          <UiIconWallet class="size-5" />
        </UiItem3>

        <Teleport to="body">
          <BaseBottomSheet2
            v-if="modals.wallets"
            isShow
            drugClassesCustom="max-w-md bg-foreground-1 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 rounded-xl"
            @closed="modals.wallets = false"
          >
            <template #handler="{ close }">
              <div class="relative z-20">
                <BaseBottomSheetHandler />
                <BaseBottomSheetClose @onClick="close" />
              </div>
            </template>

            <template #default="{ close }">
              <div class="bg-foreground-1 grid h-full max-h-[70vh] grid-rows-[auto,1fr,auto] overflow-hidden pt-1">
                <UiTitle9 class="!px-4 !py-2">
                  {{ t("dates.select") }}
                </UiTitle9>

                <div class="scrollerBlock grid h-full grid-rows-[auto,1fr] gap-1 overflow-hidden overflow-y-auto px-1">
                  <WalletsSelector
                    class="min-w-72"
                    :selectedIds="filter?.walletsIds.value"
                    @onSelected="filter.toggleWalletId"
                  />
                </div>
                <div class="flex-center px-3 py-2">
                  <UiButtonBlue
                    rounded
                    @click="close"
                  >
                    {{ t("base.save") }}
                  </UiButtonBlue>
                </div>
              </div>
            </template>
          </BaseBottomSheet2>
        </Teleport>
      </template>
    </template>

    <UiItem3
      v-if="filter?.isShow?.value"
      class="bg-item-4 justify-center"
      :class="itemAddClasses"
      @click="filter.clearFilter"
    >
      <Icon name="lucide:delete" size="20" />
    </UiItem3>
  </div>
</template>

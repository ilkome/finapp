<script setup lang="ts">
import { usePointer, useWindowSize } from '@vueuse/core'

import type { FilterProvider } from '~/components/filter/types'

const props = defineProps<{
  isShowCategories?: boolean
  isShowWallets?: boolean
}>()

const filter = inject('filter') as FilterProvider
const { t } = useI18n()
const { width } = useWindowSize()
const { pointerType } = usePointer()
const isLaptop = computed(() => width.value >= 766 && pointerType.value === 'mouse')

const modals = ref({
  categories: false,
  wallets: false,
})
</script>

<template>
  <div class="_bg-item-4 flex gap-2 rounded-md p-px">
    <template v-if="props.isShowCategories">
      <!-- Categories -->
      <UPopover v-if="isLaptop">
        <UiItem3>
          <Icon name="hugeicons:folder-library" size="20" />
        </UiItem3>

        <template #panel="{ close }">
          <UiPopoverWrap
            :title="t('categories.title')"
            @close="close"
          >
            <CategoriesSelector
              class="min-w-72"
              :selectedIds="filter?.categoriesIds.value"
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
          <Icon name="hugeicons:folder-library" size="20" />
        </UiItem3>

        <Teleport to="body">
          <BottomSheet
            v-if="modals.categories"
            isShow
            drugClassesCustom="bottomSheetDrugClassesCustom"
            @closed="modals.categories = false"
          >
            <template #handler="{ close }">
              <BottomSheetHandler />
              <BottomSheetClose @onClick="close" />
            </template>

            <template #default="{ close }">
              <div class="bottomSheetContent">
                <UiTitleModal>
                  {{ t('categories.select') }}
                </UiTitleModal>

                <div class="scrollerBlock bottomSheetContentInside">
                  <CategoriesSelector
                    :selectedIds="filter?.categoriesIds.value"
                    @onSelected="filter.toggleCategoryId"
                    @filter="filter.toggleCategoryId"
                  />
                </div>

                <div class="bottomSheetContentBottom">
                  <UiButtonBlue
                    rounded
                    @click="close"
                  >
                    {{ t('base.save') }}
                  </UiButtonBlue>
                </div>
              </div>
            </template>
          </BottomSheet>
        </Teleport>
      </template>
    </template>

    <!-- Wallets -->
    <template v-if=" props.isShowWallets">
      <UPopover v-if="isLaptop">
        <UiItem3>
          <Icon name="hugeicons:wallet-01" />
        </UiItem3>

        <template #panel="{ close }">
          <UiPopoverWrap
            :title="t('wallets.title')"
            @close="close"
          >
            <WalletsSelector
              :selectedIds="filter?.walletsIds.value"
              class="min-w-72 px-2"
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
          <Icon name="hugeicons:wallet-01" />
        </UiItem3>

        <Teleport to="body">
          <BottomSheet
            v-if="modals.wallets"
            isShow
            drugClassesCustom="bottomSheetDrugClassesCustom"
            @closed="modals.wallets = false"
          >
            <template #handler="{ close }">
              <BottomSheetHandler />
              <BottomSheetClose @onClick="close" />
            </template>

            <template #default="{ close }">
              <div class="bottomSheetContent">
                <UiTitleModal>
                  {{ t('wallets.select') }}
                </UiTitleModal>

                <div class="scrollerBlock bottomSheetContentInside">
                  <WalletsSelector
                    class="min-w-72"
                    :selectedIds="filter?.walletsIds.value"
                    @onSelected="filter.toggleWalletId"
                  />
                </div>

                <div class="bottomSheetContentBottom">
                  <UiButtonBlue
                    rounded
                    @click="close"
                  >
                    {{ t('base.save') }}
                  </UiButtonBlue>
                </div>
              </div>
            </template>
          </BottomSheet>
        </Teleport>
      </template>
    </template>
  </div>
</template>

<i18n lang="yaml">
en:
  categories:
    select: Select categories

  wallets:
    select: Select wallets

ru:
  categories:
    select: Выбрать категории

  wallets:
    select: Выбрать кошельки
</i18n>

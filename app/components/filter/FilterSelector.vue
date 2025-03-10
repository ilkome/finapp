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
  <div class="flex">
    <template v-if="props.isShowCategories">
      <!-- Categories: PC -->
      <UPopover
        v-if="isLaptop"
        class="group"
      >
        <UiItem1>
          <Icon name="hugeicons:folder-library" size="20" />
        </UiItem1>

        <template #panel="{ close }">
          <UiPopoverWrap
            :title="t('categories.title')"
            @close="close"
          >
            <CategoriesSelector
              :selectedIds="filter?.categoriesIds.value"
              class="min-w-80"
              @filter="filter.toggleCategoryId"
              @onSelected="filter.toggleCategoryId"
              @setCategories="filter.setCategories"
            />
          </UiPopoverWrap>
        </template>
      </UPopover>

      <!-- Categories: Mobile -->
      <template v-else>
        <UiItem1
          @click="modals.categories = true"
        >
          <Icon name="hugeicons:folder-library" size="20" />
        </UiItem1>

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
                  <UiButtonAccent
                    rounded
                    @click="close"
                  >
                    {{ t('base.apply') }}
                  </UiButtonAccent>
                </div>
              </div>
            </template>
          </BottomSheet>
        </Teleport>
      </template>
    </template>

    <template v-if=" props.isShowWallets">
      <!-- Wallets: PC -->
      <UPopover
        v-if="isLaptop"
        class="group"
      >
        <UiItem1>
          <Icon name="hugeicons:wallet-01" />
        </UiItem1>

        <template #panel="{ close }">
          <UiPopoverWrap
            :title="t('wallets.title')"
            @close="close"
          >
            <WalletsSelector
              :selectedIds="filter?.walletsIds.value"
              class="min-w-80 px-2"
              @onSelected="filter.toggleWalletId"
            />
          </UiPopoverWrap>
        </template>
      </UPopover>

      <!-- Wallets: Mobile -->
      <template v-else>
        <UiItem1
          @click="modals.wallets = true"
        >
          <Icon name="hugeicons:wallet-01" />
        </UiItem1>

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
                    :selectedIds="filter?.walletsIds.value"
                    class="min-w-80"
                    @onSelected="filter.toggleWalletId"
                  />
                </div>

                <div class="bottomSheetContentBottom">
                  <UiButtonAccent
                    rounded
                    @click="close"
                  >
                    {{ t('base.apply') }}
                  </UiButtonAccent>
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

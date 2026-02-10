<script setup lang="ts">
import Swiper from 'swiper'
import { Pagination } from 'swiper/modules'

import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { getParentCategoryIdOrReturnSame } from '~/components/categories/utils'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

import 'swiper/css'

const props = withDefaults(
  defineProps<{
    initialSlide?: number
    maxHeight?: string
  }>(),
  {
    initialSlide: 0,
    maxHeight: '60vh',
  },
)

const isShow = defineModel('isShow', {
  default: false,
})

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const trnsFormStore = useTrnsFormStore()

const sliderRef = ref<any>(null)
const sliderObj = ref<any>(null)
onMounted(() => {
  if (!sliderObj.value) {
    sliderObj.value = new Swiper(sliderRef.value, {
      init: false,
      initialSlide: props.initialSlide,
      longSwipesMs: 60,
      longSwipesRatio: 0.1,
      modules: [Pagination],
      pagination: {
        clickable: true,
        el: '.trnFormSelectionPagination',
      },
      shortSwipes: false,
    })
    sliderObj.value.init()
  }
})

const parentCategoryId = ref<CategoryId | null>(getParentCategoryIdOrReturnSame(categoriesStore.items, trnsFormStore.values.categoryId))

function onSelectWallet(id: WalletId, close: () => void) {
  trnsFormStore.values.walletId = id
  close()
}

function onSelectCategory(id: CategoryId, close: () => void) {
  trnsFormStore.values.categoryId = id
  close()
}

async function onSelectParentCategory(id: CategoryId) {
  parentCategoryId.value = id
  await nextTick()
  sliderObj.value.update()
  sliderObj.value.slideTo(3)
}
</script>

<template>
  <Teleport to="body">
    <BottomSheet
      :isShow="isShow"
      drugClassesCustom="bg-[var(--item-1)] max-w-md"
      @closed="isShow = false"
    >
      <template #handler="{ close }">
        <BottomSheetHandler />
        <BottomSheetClose @onClick="close" />
      </template>

      <template #default="{ close }">
        <div ref="sliderRef" class="swiper-container">
          <div class="swiper-wrapper">
            <!-- Wallets -->
            <div
              :style="{ height: props.maxHeight }"
              class="swiper-slide"
            >
              <div class="scrollerBlock h-full overflow-y-auto pb-3">
                <TrnFormSelectionWalletsAll
                  :maxHeight="maxHeight"
                  @onSelectWallet="id => onSelectWallet(id, close)"
                />
              </div>
            </div>

            <!-- Categories fast -->
            <div
              :style="{ height: props.maxHeight }"
              class="swiper-slide"
            >
              <div class="scrollerBlock grid h-full gap-4 overflow-y-auto pb-3">
                <TrnFormSelectionCategoriesFast
                  @onSelectCategory="id => onSelectCategory(id, close)"
                  @onSelectParentCategory="id => onSelectParentCategory(id)"
                />
              </div>
            </div>

            <!-- Categories -->
            <div
              :style="{ height: props.maxHeight }"
              class="swiper-slide"
            >
              <div class="scrollerBlock h-full overflow-y-auto pb-3">
                <UiTitle3
                  class="sticky top-0 z-10 bg-[var(--item-1)] px-3 pt-4 pb-3"
                  @click="trnsFormStore.ui.catsRootModal = true"
                >
                  {{ t('categories.title') }}
                </UiTitle3>
                <CategoriesSelector
                  @onSelected="id => onSelectCategory(id, close)"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="trnFormSelectionPagination" />
      </template>
    </BottomSheet>
  </Teleport>
</template>

<style>
@reference '~/assets/css/main.css';

.trnFormSelectionPagination.swiper-pagination-horizontal .swiper-pagination-bullet-active {
  @apply !bg-neutral-600 dark:!bg-white/80;
}

.trnFormSelectionPagination.swiper-pagination-horizontal {
  @apply absolute bottom-[1px] left-1/2 z-[2] flex w-auto -translate-x-1/2 items-center justify-center rounded-md bg-[rgba(23,23,23,0.9)] p-1.5;
}

.trnFormSelectionPagination.swiper-pagination-horizontal .swiper-pagination-bullet {
  @apply m-1 size-1.5 rounded-full bg-item-7 opacity-100;
}
</style>

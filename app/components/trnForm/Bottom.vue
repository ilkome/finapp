<script setup lang="ts">
import Swiper from 'swiper'
import { Pagination } from 'swiper/modules'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

import 'swiper/css'

const trnsFormStore = useTrnsFormStore()
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()
const isShow = computed(() =>
  walletsStore.hasItems
  && categoriesStore.hasItems
  && trnsFormStore.ui.isShow,
)

/**
 * Slider
 */
const sliderRef = ref<any>(null)
const sliderObj = ref<any>(null)
const maxHeight = ref('550px')

function setTrnFormHeight() {
  const el = document.querySelector('.getHeight')

  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const height = entry.contentRect.height
      maxHeight.value = `${height}px`
    }
  })

  if (el)
    observer.observe(el)
}

function init() {
  if (!sliderObj.value) {
    sliderObj.value = new Swiper(sliderRef.value, {
      // centeredSlides: true,
      init: false,
      initialSlide: 1,
      longSwipesMs: 60,
      longSwipesRatio: 0.1,
      modules: [Pagination],
      pagination: {
        clickable: true,
        el: '.trnForm__pagination',
      },
      shortSwipes: false,
      slidesPerView: 'auto',
    })
    setTrnFormHeight()
    sliderObj.value.init()
  }
}

watch(isShow, () => {
  if (isShow.value && sliderObj.value)
    sliderObj.value.slideTo(1, 0)
})

onMounted(init)
</script>

<template>
  <BottomSheet
    :isShow="isShow"
    drugClassesCustom="max-h-[98dvh] max-w-md"
    @closed="trnsFormStore.onClose()"
  >
    <template #handler="{ close }">
      <BottomSheetHandler />
      <BottomSheetClose @onClick="close" />
    </template>

    <div class="trnForm @container/trnForm bg-item-5">
      <div ref="sliderRef" class="swiper-container">
        <div class="swiper-wrapper">
          <!-- History -->
          <div
            class="swiper-slide h-full overflow-y-auto bg-item-5"
            :style="{ height: maxHeight }"
          >
            <TrnFormTrnsSlide
              :slider="sliderObj"
              :mainSlideIdx="1"
              class="overflow-hidden px-2 pb-6 pt-4"
            />
          </div>

          <!-- Main -->
          <div class="swiper-slide getHeight bg-item-5">
            <div class="scrollerBlock h-full overflow-y-auto">
              <div class="max-h-[98dvh]">
                <TrnFormMain :maxHeight />
              </div>
            </div>
          </div>

          <!-- Quick selector -->
          <div
            class="swiper-slide bg-item-5"
            :style="{ height: maxHeight }"
          >
            <div class="scrollerBlock h-full overflow-y-auto">
              <div class="pb-4">
                <TrnFormSelectionWalletsFast
                  class="pb-6"
                />
                <TrnFormSelectionCategoriesFast
                  @onSelectCategory="id => trnsFormStore.values.categoryId = id"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="trnForm__pagination" />
    </div>
  </BottomSheet>

  <!-- Modals -->
  <LazyTrnFormModalDescription v-if="trnsFormStore.modal.description" />
</template>

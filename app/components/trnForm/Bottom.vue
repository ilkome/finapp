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
const sliderRef = ref<HTMLElement | null>(null)
const sliderObj = ref<Swiper | null>(null)
const maxHeight = ref('550px')

let resizeObserver: ResizeObserver | null = null

function setTrnFormHeight() {
  const el = document.querySelector('.getHeight')

  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const height = entry.contentRect.height
      maxHeight.value = `${height}px`
    }
  })

  if (el)
    resizeObserver.observe(el)
}

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

function init() {
  if (!sliderObj.value) {
    sliderObj.value = new Swiper(sliderRef.value!, {
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
    dragClassesCustom="max-h-[98dvh] max-w-md"
    @closed="trnsFormStore.onClose()"
  >
    <template #handler="{ close }">
      <BottomSheetHandler />
      <BottomSheetClose @click="close" />
    </template>

    <div class="trnForm bg-default @container/trnForm">
      <div ref="sliderRef" class="swiper-container">
        <div class="swiper-wrapper">
          <!-- History -->
          <div
            class="swiper-slide bg-default h-full overflow-y-auto"
            :style="{ height: maxHeight }"
          >
            <TrnFormTrnsSlide
              :slider="sliderObj as any"
              :mainSlideIdx="1"
              class="overflow-hidden px-2 pt-4 pb-6"
            />
          </div>

          <!-- Main -->
          <div class="swiper-slide getHeight bg-default">
            <div class="scrollerBlock h-full overflow-y-auto">
              <div class="max-h-[98dvh]">
                <TrnFormMain
                  :maxHeight
                />
              </div>
            </div>
          </div>

          <!-- Quick selector -->
          <div
            class="swiper-slide bg-default"
            :style="{ height: maxHeight }"
          >
            <div class="scrollerBlock h-full overflow-y-auto">
              <div class="grid gap-4 pb-4">
                <TrnFormSelectionWalletsFast />
                <TrnFormSelectionCategoriesFast
                  @selectCategory="id => trnsFormStore.values.categoryId = id"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="trnForm__pagination" />
    </div>
  </BottomSheet>
</template>

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

const sliderRef = ref<HTMLElement | null>(null)
const sliderObj = shallowRef<Swiper | null>(null)
const maxHeight = ref('550px')

let resizeObserver: ResizeObserver | null = null

function setTrnFormHeight() {
  resizeObserver?.disconnect()

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

function init(el: HTMLElement) {
  sliderObj.value = new Swiper(el, {
    init: false,
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

watch(isShow, () => {
  if (isShow.value && sliderObj.value)
    sliderObj.value.slideTo(0, 0)
})

// Reka renders the drawer content after this component mounts, so the slider waits for its element.
watch(sliderRef, (el) => {
  sliderObj.value?.destroy()
  sliderObj.value = null
  if (el)
    init(el)
}, { flush: 'post' })
</script>

<template>
  <Drawer
    forceMount
    :open="isShow"
    @closed="trnsFormStore.onClose()"
    @update:open="value => !value && (trnsFormStore.ui.isShow = false)"
  >
    <div class="trnForm @container/trnForm bg-default">
      <div ref="sliderRef" class="swiper-container">
        <div class="swiper-wrapper">
          <!-- Main -->
          <div class="swiper-slide getHeight bg-default">
            <div class="h-full scroller-block overflow-y-auto">
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
            <div class="h-full scroller-block overflow-y-auto">
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
  </Drawer>
</template>

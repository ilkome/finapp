<script setup lang="ts">
import Swiper, { Pagination } from 'swiper'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import 'swiper/css'

const trnFormStore = useTrnFormStore()
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()
const isShow = computed(() =>
  walletsStore.hasItems
  && categoriesStore.hasItems
  && trnFormStore.ui.isShow,
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

onMounted(init)
</script>

<template>
  <BaseBottomSheet2
    :isShow="isShow"
    drugClassesCustom="max-h-[100dvh] md:bottom-1/2 md:-translate-x-1/2 md:translate-y-1/2"
    @closed="trnFormStore.onClose()"
  >
    <template #handler>
      <BaseBottomSheetHandler />
    </template>

    <div class="trnForm lg:ml-12 bg-foreground-1">
      <div ref="sliderRef" class="swiper-container">
        <div class="swiper-wrapper">
          <!-- History -->
          <div
            class="swiper-slide bg-foreground-1 sm:max-w-xs sm:rounded-l-xl"
            :style="{ height: maxHeight }"
          >
            <TrnFormTrnsSlide
              :slider="sliderObj"
              class="overflow-hidden px-2 pt-4 pb-6"
            />
          </div>

          <!-- Main -->
          <div class="swiper-slide getHeight sm:px-3 bg-foreground-1 sm:max-w-sm _sm:rounded-xl sm:border-r sm:border-l border-item-5">
            <div class="scroll scrollerBlock">
              <TrnFormMain :maxHeight />
            </div>
          </div>

          <!-- Quick selector -->
          <div
            class="swiper-slide bg-foreground-1 sm:max-w-[380px] sm:rounded-r-xl"
            :style="{ height: maxHeight }"
          >
            <div class="scroll scrollerBlock">
              <div class="pb-4 pt-4">
                <TrnFormSelectionWalletsFast
                  class="pb-6"
                />
                <TrnFormSelectionCategoriesFast
                  @onSelectCategory="id => trnFormStore.values.categoryId = id"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="trnForm__pagination" />
    </div>
  </BaseBottomSheet2>

  <!-- Modals -->
  <LazyTrnFormModalDescription v-if="trnFormStore.modal.description" />
</template>

<style lang="stylus" scoped>
@import "../app/assets/stylus/variables/*"

.scroll
  overflow hidden
  overflow-y auto
  height 100%
  scrollbar()
</style>

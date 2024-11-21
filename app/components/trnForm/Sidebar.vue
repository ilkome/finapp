<script setup lang="ts">
import Swiper, { Pagination } from 'swiper'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import 'swiper/css'

const trnsFormStore = useTrnsFormStore()
const isShow = computed(() => trnsFormStore.ui.isShow)

/**
 * Slider
 */
const sliderRef2 = ref<any>(null)
const sliderObj = ref<any>(null)

function init() {
  if (!sliderObj.value) {
    sliderObj.value = new Swiper(sliderRef2.value, {
      init: true,
      initialSlide: 0,
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
  }
}

watch(isShow, (v) => {
  if (v) {
    setTimeout(() => init(), 10)
  }
  else {
    sliderObj.value?.destroy()
    sliderObj.value = null
  }
})
</script>

<template>
  <Transition name="fadeIn" appear>
    <div
      v-if="isShow"
      class="trnForm bg-foreground-1 border-item-5 absolute left-0 top-0 z-50 h-full w-96 overflow-hidden border-r-2 shadow-2xl"
    >
      <div class="absolute right-2 top-2">
        <BaseBottomSheetClose @onClick="trnsFormStore.onClose()" />
      </div>

      <div ref="sliderRef2" class="swiper-container h-full">
        <div class="swiper-wrapper">
          <!-- Main -->
          <div class="swiper-slide bg-foreground-1 h-full">
            <div class="scroll scrollerBlock grid grid-rows-[auto,1fr] gap-4">
              <TrnFormMain maxHeight="100vh" class="!pb-0" />

              <!-- History -->
              <TrnFormTrnsSlide
                :slider="sliderObj"
                class="px-2 pb-6"
              />
            </div>
          </div>

          <!-- Quick selector -->
          <div
            class="swiper-slide bg-foreground-1"
            :style="{ height: '100%' }"
          >
            <div class="scroll scrollerBlock">
              <div class="py-4">
                <TrnFormSelectionWalletsFast class="pb-6" />
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
  </Transition>

  <!-- Modals -->
  <LazyTrnFormModalDescription v-if="trnsFormStore.modal.description" />
</template>

<style scoped>
.fadeIn {
  &-enter-active,
  &-leave-active {
    @apply opacity-100 translate-x-0 transition-all duration-300 ease-in-out;
  }

  &-enter-from,
  &-leave-to {
    @apply opacity-0 -translate-x-12;
  }
}
</style>

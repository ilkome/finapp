<script setup lang="ts">
import Swiper from 'swiper'
import { Pagination } from 'swiper/modules'

import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

import 'swiper/css'

const { t } = useI18n()
const trnsFormStore = useTrnsFormStore()
const isShow = computed(() => trnsFormStore.ui.isShow)

/**
 * Slider
 */
const sliderRef = ref<any>(null)
const sliderObj = ref<any>(null)

function init() {
  if (!sliderObj.value) {
    sliderObj.value = new Swiper(sliderRef.value, {
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
      class="trnForm @container/trnForm fixed inset-y-0 right-0 z-50 h-dvh w-[360px] py-4"
    >
      <div class="border-left border-item-6 border-item-4 bg-item-2 relative h-full overflow-hidden rounded-l-xl border border-r-0 shadow-2xl">
        <div class="absolute top-2 right-2">
          <BottomSheetClose @onClick="trnsFormStore.onClose()" />
        </div>

        <div ref="sliderRef" class="swiper-container h-full">
          <div class="swiper-wrapper">
            <!-- Main -->
            <div class="swiper-slide bg-default h-full">
              <div class="scrollerBlock grid h-full grid-rows-[auto_1fr] items-start gap-4 overflow-y-auto overscroll-contain">
                <TrnFormMain
                  maxHeight="100vh"
                  class="!pb-0"
                  typesPosition="top"
                />
                <div
                  v-if="trnsFormStore.values.trnType !== 2"
                  class="-mt-8 grid gap-2 pb-6"
                >
                  <TrnFormSelectionCategoriesFast
                    @onSelectCategory="id => trnsFormStore.values.categoryId = id"
                  />
                </div>
              </div>
            </div>

            <!-- Quick selector -->
            <div
              class="swiper-slide bg-[var(--bg-)]"
              :style="{ height: '100%' }"
            >
              <div class="scrollerBlock h-full overflow-y-auto overscroll-contain">
                <UiTitle3 class="bg-default sticky top-0 z-10 px-4 pt-5 pb-3 md:text-xl">
                  {{ t('trns.history') }}
                </UiTitle3>

                <TrnFormTrnsSlide
                  :slider="sliderObj"
                  :mainSlideIdx="0"
                  class="px-2 pb-6"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="trnForm__pagination" />
      </div>
    </div>
  </Transition>
</template>

<style>
@reference '~/assets/css/main.css';

.fadeIn-enter-active,
.fadeIn-leave-active {
  @apply opacity-100 translate-x-0 transition-all duration-300 ease-in-out;
}

.fadeIn-enter-from,
.fadeIn-leave-to {
  @apply opacity-0 translate-x-full;
}
</style>

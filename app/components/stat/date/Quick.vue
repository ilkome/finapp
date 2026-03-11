<script setup lang="ts">
import Swiper from 'swiper'
import 'swiper/css'

import { statDateKey } from '~/components/stat/injectionKeys'

const statDate = inject(statDateKey)!

const sliderRef = ref<HTMLElement | null>(null)
const sliderObj = ref<Swiper | null>(null)

onMounted(() => {
  const initialSlide = 1

  sliderObj.value = new Swiper(sliderRef.value!, {
    autoHeight: true,
    initialSlide,
    longSwipesMs: 60,
    longSwipesRatio: 0.1,
    observeParents: true,
    observer: true,
    shortSwipes: false,
    slidesPerView: 1,
    touchStartPreventDefault: false,
  })
})
</script>

<template>
  <div class="relative overflow-hidden">
    <div ref="sliderRef" class="swiper-container">
      <div class="swiper-wrapper">
        <div class="swiper-slide">
          <DateRanges
            :itemProps="{ variant: 'small' }"
            :statDate
            view="periods"
          />
        </div>

        <div class="swiper-slide">
          <DateRanges
            :itemProps="{ variant: 'small' }"
            :statDate
            view="presets"
          />
        </div>

        <div class="swiper-slide">
          <DateRanges
            :itemProps="{ variant: 'small' }"
            :statDate
            view="maximum"
          />
        </div>
      </div>
    </div>
  </div>
</template>

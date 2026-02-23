<script setup lang="ts">
import Swiper from 'swiper'
import 'swiper/css'

import { statDateKey } from '~/components/stat/injectionKeys'

const emit = defineEmits<{
  close: []
}>()

const statDate = inject(statDateKey)!

const sliderRef = ref<any>(null)
const sliderObj = ref<any>(null)

onMounted(() => {
  const initialSlide = 1

  sliderObj.value = new Swiper(sliderRef.value, {
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
            @close="emit('close')"
          />
        </div>

        <div class="swiper-slide">
          <DateRanges
            :itemProps="{ variant: 'small' }"
            :statDate
            view="presets"
            @close="emit('close')"
          />
        </div>

        <div class="swiper-slide">
          <DateRanges
            :itemProps="{ variant: 'small' }"
            :statDate
            view="maximum"
            @close="emit('close')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

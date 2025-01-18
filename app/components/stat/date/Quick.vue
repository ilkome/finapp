<script setup lang="ts">
import Swiper from 'swiper'
import 'swiper/css'

import type { StatDateProvider } from '~/components/date/types'

const emit = defineEmits<{
  onClose: []
}>()

const { t } = useI18n()
const statDate = inject('statDate') as StatDateProvider

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
            @onClose="emit('onClose')"
          />
        </div>

        <div class="swiper-slide">
          <DateRanges
            :itemProps="{ variant: 'small' }"
            :statDate
            view="presets"
            @onClose="emit('onClose')"
          />
        </div>

        <div class="swiper-slide">
          <DateRanges
            :itemProps="{ variant: 'small' }"
            :statDate
            view="maximum"
            @onClose="emit('onClose')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useStatPage from '~/components/stat/useStatPage'
const { statPage } = useStatPage()
</script>

<template lang="pug">
.swiper-slide.h-full.overflow-hidden.overflow-y-auto(
  class="pt-[70px] pb-[44px]"
)
  .my-6.mx-2.p-3.rounded-lg.bg-skin-item-main-active(v-if="statPage.filter.isShow")
    LazyStatFilter(v-if="statPage.filter.isShow")

  slot

  .my-6
    StatPeriodArrows
</template>

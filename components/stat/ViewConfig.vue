<script setup lang="ts">
import useUIView from '~/components/layout/useUIView'

const { ui, setUI } = useUIView()
function toggleView(name) {
  setUI({ name, value: !ui[name] })
}
</script>

<template lang="pug">
.flex.bg-item-main-bg.rounded-md
  .cursor-pointer.w-10.py-2.px-2.flex-center.rounded-md.hocus_bg-item-main-hover(
    :class="{ 'text-item-base-up': ui.showPieChart }"
    @click="toggleView('showPieChart')"
  ): .mdi.mdi-chart-pie

  .cursor-pointer.w-10.py-2.px-2.flex-center.rounded-md.hocus_bg-item-main-hover(
    :class="{ 'text-item-base-up': ui.showCatsVerticalChart }"
    @click="toggleView('showCatsVerticalChart')"
  ): .mdi.mdi-poll

  .cursor-pointer.w-10.py-2.px-2.flex-center.rounded-md.hocus_bg-item-main-hover(
    :class="{ 'text-item-base-up': ui.showRoundCats }"
    @click="toggleView('showRoundCats')"
  ): .mdi.mdi-chart-bubble

  .cursor-pointer.w-10.py-2.px-2.flex-center.rounded-md.hocus_bg-item-main-hover(
    :class="{ 'text-item-base-up': ui.showCatsHorizontalList }"
    @click="toggleView('showCatsHorizontalList')"
  ): .mdi.mdi-chart-timeline
</template>

<script setup lang="ts">
import useUIView from '~/components/layout/useUIView'

const { ui, setUI } = useUIView()
function toogleView(name) {
  setUI({ name, value: !ui[name] })
}
</script>

<template lang="pug">
.flex.bg-skin-item-main-bg.rounded-md
  .cursor-pointer.w-10.py-2.px-2.flex-center.rounded-md.hocus_bg-skin-item-main-hover(
    :class="{ 'text-skin-item-base-up': ui.showPieChart }"
    @click="toogleView('showPieChart')"
  ): .mdi.mdi-chart-pie

  .cursor-pointer.w-10.py-2.px-2.flex-center.rounded-md.hocus_bg-skin-item-main-hover(
    :class="{ 'text-skin-item-base-up': ui.showCatsVerticalChart }"
    @click="toogleView('showCatsVerticalChart')"
  ): .mdi.mdi-poll

  .cursor-pointer.w-10.py-2.px-2.flex-center.rounded-md.hocus_bg-skin-item-main-hover(
    :class="{ 'text-skin-item-base-up': ui.showRoundCats }"
    @click="toogleView('showRoundCats')"
  ): .mdi.mdi-chart-bubble

  .cursor-pointer.w-10.py-2.px-2.flex-center.rounded-md.hocus_bg-skin-item-main-hover(
    :class="{ 'text-skin-item-base-up': ui.showCatsHorizontalList }"
    @click="toogleView('showCatsHorizontalList')"
  ): .mdi.mdi-chart-timeline
</template>

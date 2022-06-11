<script setup lang="ts">
const isShowDateSelector = ref(false)
</script>

<template lang="pug">
.z-10.hocus_bg-skin-item-main-hover
  //- Date
  .cursor-pointer.px-2.flex.items-center.text-lg(
    @click="isShowDateSelector = true"
  )
    .py-3.text-skin-item-base-up.font-semibold.font-nunito.leading-none
      SharedDate(
        :date="$store.state.filter.date"
        :period="$store.state.filter.period"
      )

    .mdi.mdi-dots-vertical

  LazyDateSelector(
    v-if="isShowDateSelector"
    @close="isShowDateSelector = false"
  )
</template>

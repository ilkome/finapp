<script setup lang="ts">
const isShowDateSelector = ref(false)
</script>

<template lang="pug">
.z-10.hocus_bg-skin-item-main-hover
  //- Date
  .cursor-pointer.px-2.flex.items-center.text-lg(
    @click="isShowDateSelector = true"
  )
    .py-4.lg_py-6.font-nunito.text-neutral-800.dark_text-white.text-xl.lg_text-2xl.leading-none.font-semibold
      SharedDate

    .mdi.mdi-dots-vertical

  LazyDateSelector(
    v-if="isShowDateSelector"
    @close="isShowDateSelector = false"
  )
</template>

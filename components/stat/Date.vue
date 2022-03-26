<script setup lang="ts">
const isShowDateSelector = ref(false)
</script>

<template lang="pug">
.z-10.hocus_bg-gray-100.dark_hocus_bg-neutral-800
  //- Date
  .menuDots.cursor-pointer.px-3.flex.items-center.text-lg(
    @click="isShowDateSelector = true"
  )
    .py-6.font-nunito.text-neutral-800.dark_text-white.text-2xl.leading-none.font-semibold
      SharedDate

    .menuDots__dots: .mdi.mdi-dots-vertical

  LazyDateSelector(
    v-if="isShowDateSelector"
    @close="isShowDateSelector = false"
  )
</template>

<style lang="stylus" scoped>
.menuDots
  &__dots
    margin-top -2px
    margin-right -5px
    padding-top 3px
    padding-left 4px
    color var(--c-font-2)
    font-size 16px

    +media(600px)
      padding-left 6px
      font-size 22px
</style>

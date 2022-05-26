<script setup lang="ts">
defineProps<{
  dateClasses?: null
  wrapClasses?: null
}>()
const isShowDateSelector = ref(false)
</script>

<template lang="pug">
.z-10.hocus_bg-skin-item-main-hover
  //- Date
  .cursor-pointer.px-3.flex.items-center.text-lg(
    @click="isShowDateSelector = true"
    class="wrapClasses"
  )
    .py-3.font-nunito.text-neutral-800.dark_text-white.text-xl.lg_text-2xl.leading-none.font-semibold(
      :class="dateClasses"
    )
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

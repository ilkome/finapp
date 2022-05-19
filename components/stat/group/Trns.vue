<script setup lang="ts">
defineProps<{
  isShowIncome: Boolean
  isShowExpense: Boolean
}>()
</script>

<template lang="pug">
.my-4(class="max-w-[420px]")
  .pb-2.text-lg.leading-none.font-nunito.font-semibold.text-skin-item-base {{ $t('trns.inPeriodTitle') }}

  TrnsList(
    :expense="isShowExpense"
    :income="isShowIncome"
    :size="12"
    classNames="md_grid-cols-1"
  )
</template>

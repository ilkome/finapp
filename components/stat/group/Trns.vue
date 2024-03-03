<script setup lang="ts">
const props = defineProps<{
  isShowIncome: boolean
  isShowExpense: boolean
}>()

const trnsIds = computed(() => {
  const trnsItems = trnsStore.items
  let trnsIds = trnsStore.selectedTrnsIdsWithDate

  // filter type
  if (props.isShowIncome)
    trnsIds = trnsIds.filter(id => trnsItems[id].type === 1)
  if (props.isShowExpense)
    trnsIds = trnsIds.filter(id => trnsItems[id].type === 0)

  return trnsIds
})
</script>

<template lang="pug">
.my-6(class="max-w-[420px]")
  .pb-2.text-lg.leading-none.font-nunito.font-semibold.text-item-base
    | {{ $t('trns.inPeriodTitle') }}

  TrnsList(
    :size="12"
    :trnsIds="trnsIds"
    isShowFilter
    uiHistory
  )
</template>

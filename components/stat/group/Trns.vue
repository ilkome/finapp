<script setup lang="ts">
const props = defineProps<{
  isShowIncome: boolean
  isShowExpense: boolean
}>()

const { $store } = useNuxtApp()

const trnsIds = computed(() => {
  const trnsItems = $store.state.trns.items
  let trnsIds = $store.getters['trns/selectedTrnsIdsWithDate']

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
  .pb-2.text-lg.leading-none.font-nunito.font-semibold.text-skin-item-base
    | {{ $t('trns.inPeriodTitle') }}

  TrnsList(
    :size="12"
    :trnsIds="trnsIds"
    isShowFilter
    uiHistory
  )
</template>

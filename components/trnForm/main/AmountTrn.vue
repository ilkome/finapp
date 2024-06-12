<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const trnFormStore = useTrnFormStore()
</script>

<template lang="pug">
.pb-2.px-2
  TrnFormMainInput(
    :amount="trnFormStore.values.amount[trnFormStore.activeAmountIdx]"
    :amountRaw="trnFormStore.values.amountRaw[trnFormStore.activeAmountIdx]"
    :highlight="trnFormStore.values.trnType === 0 ? 'income' : 'expense'"
    :isShowSum="trnFormStore.getIsShowSum(trnFormStore.activeAmountIdx)"
    @onChange="trnFormStore.onChangeAmount"
  )
</template>

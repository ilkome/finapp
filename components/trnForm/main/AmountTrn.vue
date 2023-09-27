<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const $trnForm = useTrnFormStore()
</script>

<template lang="pug">
.pb-2.px-2
  TrnFormMainInput(
    :amount="$trnForm.values.amount[$trnForm.activeAmountIdx]"
    :amountRaw="$trnForm.values.amountRaw[$trnForm.activeAmountIdx]"
    :highlight="$trnForm.values.trnType === 0 ? 'income' : 'expense'"
    :isShowSum="$trnForm.getIsShowSum($trnForm.activeAmountIdx)"
    @onChange="$trnForm.onChangeAmount"
  )
</template>

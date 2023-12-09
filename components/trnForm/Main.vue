<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const $trnForm = useTrnFormStore()
</script>

<template lang="pug">
.py-4
  UiTitle.pb-2.px-3(@click="$trnForm.values.trnId = null")
    template(v-if="$trnForm.values.trnId") {{ $t('trnForm.titleEditTrn') }}
    template(v-if="!$trnForm.values.trnId") {{ $t('trnForm.createTrn') }}

  TrnFormMainDate
  TrnFormMainAmountTrn(v-if="$trnForm.values.trnType !== 2")
  TrnFormMainAmountTransfer(v-if="$trnForm.values.trnType === 2")

  TrnFormMainCalculator.pb-2(
    :amountRaw="$trnForm.values.amountRaw[$trnForm.activeAmountIdx]"
    @onChange="$trnForm.onChangeAmount"
  )

  //- Selected
  TrnFormMainSelectedTrn(v-if="$trnForm.values.trnType !== 2")
  TrnFormMainTypes
</template>

<script setup lang="ts">
import type { TrnType } from '~/components/trns/types'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const $trnForm = useTrnFormStore()

function setAmountType(amountType: TrnType) {
  $trnForm.onChangeTrnType(amountType)
}

function isItActive(amountType: TrnType) {
  return $trnForm.values.trnType === amountType
}
</script>

<template lang="pug">
.px-2.pb-5
  UiTabs
    UiTabsItem(
      :isActive="isItActive(0)"
      @click="setAmountType(0)"
    ) {{ $t('money.expense') }}

    UiTabsItem(
      :isActive="isItActive(1)"
      @click="setAmountType(1)"
    ) {{ $t('money.income') }}

    UiTabsItem(
      v-if="$store.getters['wallets/walletsSortedIds'].length > 1"
      :isActive="isItActive(2)"
      @click="setAmountType(2)"
    ) {{ $t('trnForm.transferTitle') }}
</template>

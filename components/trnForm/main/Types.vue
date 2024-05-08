<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import type { TrnType } from '~/components/trns/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const $trnForm = useTrnFormStore()
const walletsStore = useWalletsStore()

function setAmountType(amountType: TrnType) {
  $trnForm.onChangeTrnType(amountType)
}

function isItActive(amountType: TrnType) {
  return $trnForm.values.trnType === amountType
}
</script>

<template>
  <UiTabs class="!gap-0">
    <UiTabsItem :isActive="isItActive(0)" @click="setAmountType(0)">
      {{ $t('money.expense') }}
    </UiTabsItem>

    <UiTabsItem :isActive="isItActive(1)" @click="setAmountType(1)">
      {{ $t('money.income') }}
    </UiTabsItem>

    <UiTabsItem
      v-if="walletsStore.sortedIds.length > 1"
      :isActive="isItActive(2)"
      @click="setAmountType(2)"
    >
      {{ $t('trnForm.transferTitle') }}
    </UiTabsItem>
  </UiTabs>
</template>

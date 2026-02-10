<script setup lang="ts">
import type { TrnType } from '~/components/trns/types'

import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const trnsFormStore = useTrnsFormStore()
const walletsStore = useWalletsStore()

function setAmountType(amountType: TrnType) {
  trnsFormStore.onChangeTrnType(amountType)
}

function isItActive(amountType: TrnType) {
  return trnsFormStore.values.trnType === amountType
}
</script>

<template>
  <UiTabs1 class="!gap-0">
    <UiTabsItem3
      :isActive="isItActive(0)"
      @click="setAmountType(0)"
    >
      {{ t('money.expense') }}
    </UiTabsItem3>

    <UiTabsItem3
      :isActive="isItActive(1)"
      @click="setAmountType(1)"
    >
      {{ t('money.income') }}
    </UiTabsItem3>

    <UiTabsItem3
      v-if="walletsStore.sortedIds.length > 1"
      :isActive="isItActive(2)"
      @click="setAmountType(2)"
    >
      {{ t('trnForm.transferTitle') }}
    </UiTabsItem3>
  </UiTabs1>
</template>

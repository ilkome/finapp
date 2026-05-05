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
  <UiTabsBar class="!gap-0">
    <UiTabsItemPill
      :isActive="isItActive(0)"
      @click="setAmountType(0)"
    >
      {{ t('money.expense') }}
    </UiTabsItemPill>

    <UiTabsItemPill
      :isActive="isItActive(1)"
      @click="setAmountType(1)"
    >
      {{ t('money.income') }}
    </UiTabsItemPill>

    <UiTabsItemPill
      v-if="walletsStore.sortedIds.length > 1"
      :isActive="isItActive(2)"
      @click="setAmountType(2)"
    >
      {{ t('trnForm.transferTitle') }}
    </UiTabsItemPill>
  </UiTabsBar>
</template>

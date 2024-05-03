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
  <div class="px-2 pb-2">
    <UiTabs>
      <UiTabsItem3 :isActive="isItActive(0)" @click="setAmountType(0)">
        {{ $t('money.expense') }}
      </UiTabsItem3>

      <UiTabsItem3 :isActive="isItActive(1)" @click="setAmountType(1)">
        {{ $t('money.income') }}
      </UiTabsItem3>

      <UiTabsItem3
        v-if="walletsStore.sortedIds.length > 1"
        :isActive="isItActive(2)"
        @click="setAmountType(2)"
      >
        {{ $t('trnForm.transferTitle') }}
      </UiTabsItem3>
    </UiTabs>
  </div>
</template>

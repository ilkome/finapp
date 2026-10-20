<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletId, WalletItemComputed } from '~/components/wallets/types'

export type BankCheckRow = {
  /** The bank's balance day, formatted. */
  dateLabel: string
  /** Bank minus calculated, in the wallet's currency. */
  diff: number
  id: WalletId
  wallet: WalletItemComputed
}

const props = defineProps<{
  baseCurrencyCode: CurrencyCode
  items: BankCheckRow[]
}>()

const emit = defineEmits<{
  select: [id: string]
}>()
</script>

<template>
  <div class="grid gap-1" data-analytics-bank-check>
    <WalletsRow
      v-for="item in props.items"
      :key="item.id"
      :baseCurrencyCode="props.baseCurrencyCode"
      chevron="right"
      :data-bank-row="item.id"
      :wallet="item.wallet"
      :walletId="item.id"
      @click="emit('select', item.id)"
    >
      <template #append>
        <div class="grid justify-items-end gap-1">
          <Amount :amount="item.diff" :currencyCode="item.wallet.currencyCode" :isShowBaseRate="false" isShowPlus variant="row" />
          <UiText variant="caption">
            {{ item.dateLabel }}
          </UiText>
        </div>
      </template>
    </WalletsRow>
  </div>
</template>

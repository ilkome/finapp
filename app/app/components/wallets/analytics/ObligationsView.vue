<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletId, WalletItemComputed } from '~/components/wallets/types'

export type ObligationRow = {
  /** Every payment inside the horizon. */
  horizonTotal: number
  nextAmount: number
  nextDateLabel: string
  wallet: WalletItemComputed
  walletId: WalletId
}

const props = defineProps<{
  currencyCode: CurrencyCode
  horizonLabel: string
  items: ObligationRow[]
}>()

const emit = defineEmits<{
  select: [walletId: string]
}>()

const { t } = useI18n()
</script>

<template>
  <div v-if="props.items.length" class="grid gap-1" data-obligations>
    <WalletsRow
      v-for="item in props.items"
      :key="item.walletId"
      :baseCurrencyCode="props.currencyCode"
      chevron="right"
      :data-obligation="item.walletId"
      :wallet="item.wallet"
      :walletId="item.walletId"
      @click="emit('select', item.walletId)"
    >
      <template #append>
        <div class="grid justify-items-end gap-1">
          <Amount :amount="-item.horizonTotal" :currencyCode="props.currencyCode" :isShowBaseRate="false" variant="row" />
          <div class="flex items-center gap-1 text-2xs leading-none text-muted">
            {{ item.nextDateLabel }}
            <Amount :amount="item.nextAmount" :currencyCode="props.currencyCode" :isShowBaseRate="false" variant="secondary" />
          </div>
          <UiText variant="caption">
            {{ props.horizonLabel }}
          </UiText>
        </div>
      </template>
    </WalletsRow>
  </div>

  <UiEmpty v-else data-obligations-empty>
    {{ t('wallets.analytics.obligations.empty') }}
  </UiEmpty>
</template>

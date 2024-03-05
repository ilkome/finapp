<script setup lang="ts">
import type { WalletId, WalletItem } from './types'
import useAmount from '~/components/amount/useAmount'
import type { CurrencyCode } from '~/components/currencies/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  walletsItems: Record<WalletId, WalletItem>
  currencyCode: CurrencyCode
}>()

const { getAmountInBaseRate } = useAmount()
const walletsStore = useWalletsStore()

const totalInWallets = computed(() => {
  const walletsTotal = walletsStore.walletsTotal
  const total = {
    counted: 0,
    savings: 0,
    credits: 0,
  }

  for (const walletId in props.walletsItems) {
    let walletTotal = 0
    if (props.walletsItems[walletId].currency === props.currencyCode) {
      walletTotal = walletsTotal[walletId]
    }
    else {
      walletTotal = getAmountInBaseRate({
        amount: walletsTotal[walletId],
        currencyCode: props.walletsItems[walletId].currency,
        noFormat: true,
      })
    }

    if (props.walletsItems[walletId].countTotal)
      total.counted = total.counted + walletTotal
    else if (props.walletsItems[walletId].isCredit)
      total.credits = total.credits + walletTotal
    else
      total.savings = total.savings + walletTotal
  }

  return total
})

const counts = computed(() => ({
  credit: {
    titleId: 'credits',
    isShow: totalInWallets.value.credits !== 0,
    value: totalInWallets.value.credits,
  },
  savings: {
    titleId: 'savings',
    isShow: totalInWallets.value.savings !== 0,
    value: totalInWallets.value.savings,
  },
  withdraw: {
    titleId: 'withdrawal',
    isShow: totalInWallets.value.counted !== totalInWallets.value.counted + totalInWallets.value.savings - Math.abs(totalInWallets.value.credits),
    value: totalInWallets.value.counted,
    icon: 'UiIconWalletWithdrawal',
  },
  withCredit: {
    titleId: 'withCredit',
    isShow: totalInWallets.value.credits !== 0,
    value: totalInWallets.value.counted + totalInWallets.value.savings,
  },
  total: {
    titleId: 'total',
    isShow: true,
    value: totalInWallets.value.counted + totalInWallets.value.savings - Math.abs(totalInWallets.value.credits),
  },
}))
</script>

<template lang="pug">
.px-3.py-1.bg-item-4.rounded-md(
  v-if="walletsStore.hasWallets"
)
  template(v-for="item in counts")
    .py-2.flex.items-center.border-b.border-item-5.last_border-0(
      v-if="item.isShow"
    )
      .grow.flex.items-center.gap-3
        .text-sm.leading-none {{ $t(item.titleId) }}

      .text-item-base
        Amount(
          :currencyCode="currencyCode"
          :amount="item.value"
        )
</template>

<i18n lang="yaml">
en:
  withdrawal: Withdrawal
  credits: Credits
  withCredit: Total without credit
  savings: Savings
  total: Total

ru:
  withdrawal: Доступные
  credits: Кредиты
  withCredit: Всего без учета кредита
  savings: Вложения
  total: Всего
</i18n>

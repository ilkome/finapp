<script setup lang="ts">
import useAmount from '~/components/amount/useAmount'
import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletId, WalletItem } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  currencyCode: CurrencyCode
  walletsItems: Record<WalletId, WalletItem>
}>()

const { t } = useI18n()
const { getAmountInBaseRate } = useAmount()
const walletsStore = useWalletsStore()

const totalInWallets = computed(() => {
  const total = {
    counted: 0,
    credits: 0,
    savings: 0,
  }

  for (const walletId in props.walletsItems) {
    let walletTotal = 0
    if (props.walletsItems[walletId].currency === props.currencyCode) {
      walletTotal = walletsStore.totals[walletId]
    }
    else {
      walletTotal = getAmountInBaseRate({
        amount: walletsStore.totals[walletId],
        currencyCode: props.walletsItems[walletId].currency,
        noFormat: true,
      }) as number
    }

    if (props.walletsItems[walletId].countTotal)
      total.counted = total.counted + walletTotal
    else if (props.walletsItems[walletId].isCredit)
      total.credits = total.credits + walletTotal
    else total.savings = total.savings + walletTotal
  }

  return total
})

const counts = computed(() => ({
  credit: {
    isShow: totalInWallets.value.credits !== 0,
    titleId: 'credits',
    value: totalInWallets.value.credits,
  },
  savings: {
    isShow: totalInWallets.value.savings !== 0,
    titleId: 'savings',
    value: totalInWallets.value.savings,
  },
  total: {
    isShow: true,
    titleId: 'total',
    value:
      totalInWallets.value.counted
      + totalInWallets.value.savings
      - Math.abs(totalInWallets.value.credits),
  },
  withCredit: {
    isShow: totalInWallets.value.credits !== 0,
    titleId: 'withCredit',
    value: totalInWallets.value.counted + totalInWallets.value.savings,
  },
  withdraw: {
    icon: 'UiIconWalletWithdrawal',
    isShow:
      totalInWallets.value.counted
      !== totalInWallets.value.counted
      + totalInWallets.value.savings
      - Math.abs(totalInWallets.value.credits),
    titleId: 'withdrawal',
    value: totalInWallets.value.counted,
  },
}))

const filteredCount = computed(() =>
  Object.values(counts.value).filter(item => item.isShow),
)
</script>

<template>
  <div>
    <div
      v-for="item in filteredCount" :key="item.titleId"
      class="flex items-center gap-12 border-b border-item-5 px-2 py-2 last_border-0"
    >
      <div class="flex grow items-center gap-3 text-sm leading-none text-secondary">
        {{ t(item.titleId) }}
      </div>

      <div class="text-item-base">
        <Amount :currencyCode="currencyCode" :amount="item.value" />
      </div>
    </div>
  </div>
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

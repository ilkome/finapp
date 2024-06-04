<script setup lang="ts">
import useAmount from '~/components/amount/useAmount'
import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletId, WalletItem } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  currencyCode: CurrencyCode
  walletsItems: Record<WalletId, WalletItem>
}>()

const emit = defineEmits<{
  click: [v: string]
}>()

const { t } = useI18n()
const { getAmountInBaseRate } = useAmount()
const walletsStore = useWalletsStore()

const totalInWallets = computed(() => {
  const total = {
    all: 0,
    counted: 0,
    creditPossible: 0,
    credits: 0,
    isCash: 0,
    isCashless: 0,
    isDeposit: 0,
    withdrawal: 0,
  }

  for (const walletId in props.walletsItems) {
    let walletTotal = 0
    if (props.walletsItems[walletId].currency === props.currencyCode) {
      walletTotal = walletsStore.totals[walletId]
    }
    else {
      walletTotal = +getAmountInBaseRate({
        amount: walletsStore.totals[walletId],
        currencyCode: props.walletsItems[walletId].currency,
        noFormat: true,
      })
    }

    total.all = total.all + walletTotal

    if (props.walletsItems[walletId].isCredit && walletsStore.items[walletId].creditLimit) {
      total.creditPossible = total.creditPossible + +getAmountInBaseRate({
        amount: walletsStore.items[walletId].creditLimit,
        currencyCode: props.walletsItems[walletId].currency,
        noFormat: true,
      })
    }

    if (props.walletsItems[walletId].isDeposit)
      total.isDeposit = total.isDeposit + walletTotal

    if (props.walletsItems[walletId].isCash)
      total.isCash = total.isCash + walletTotal

    if (props.walletsItems[walletId].isCashless)
      total.isCashless = total.isCashless + walletTotal

    if (props.walletsItems[walletId].withdrawal)
      total.withdrawal = total.withdrawal + walletTotal

    if (props.walletsItems[walletId].countTotal)
      total.counted = total.counted + walletTotal
    else if (props.walletsItems[walletId].isCredit)
      total.credits = total.credits + walletTotal
  }

  return total
})

const counts = computed(() => ({
  all: {
    id: 'all',
    isShow: true,
    value: totalInWallets.value.all,
  },
  all2: {
    id: 'all2',
    isShow: true,
    value: totalInWallets.value.counted - Math.abs(totalInWallets.value.credits),
  },
  creditPossible: {
    id: 'isCredit',
    isShow: totalInWallets.value.creditPossible !== 0,
    value: totalInWallets.value.creditPossible,
  },
  isCash: {
    id: 'isCash',
    isShow: totalInWallets.value.isCash !== 0,
    value: totalInWallets.value.isCash,
  },
  isCashless: {
    id: 'isCashless',
    isShow: totalInWallets.value.isCashless !== 0,
    value: totalInWallets.value.isCashless,
  },
  isCredit: {
    id: 'isCredit',
    isShow: totalInWallets.value.credits !== 0,
    value: totalInWallets.value.credits,
  },
  isDeposit: {
    icon: 'isDeposit',
    id: 'isDeposit',
    isShow: totalInWallets.value.isDeposit !== 0,
    value: totalInWallets.value.isDeposit,
  },
  withCredit: {
    id: 'withCredit',
    isShow: totalInWallets.value.credits !== 0,
    value: totalInWallets.value.counted,
  },
  withdrawal: {
    icon: 'UiIconWalletWithdrawal',
    id: 'withdrawal',
    isShow: totalInWallets.value.withdrawal !== 0,
    value: totalInWallets.value.withdrawal,
  },
}))

const filteredCount = computed(() =>
  Object.values(counts.value).filter(item => item.isShow),
)
</script>

<template>
  <div>
    <div
      v-for="(item) in filteredCount"
      :key="item.id"
      class="flex items-center gap-12 border-b border-item-5 px-2 py-2 last_border-0"
      @click="emit('click', item.id)"
    >
      <div
        class="flex grow items-center gap-3 text-sm leading-none text-secondary"
      >
        {{ t(item.id) }}
      </div>

      <Amount
        :amount="item.value"
        :currencyCode="currencyCode"
      />
    </div>
  </div>
</template>

<i18n lang="yaml">
en:
  withdrawal: Withdrawal
  isCredit: Credits
  withCredit: Total without credit
  isSaving: Savings
  all: Total

ru:
  withdrawal: Доступные
  isCredit: Кредиты
  withCredit: Всего без учета кредита
  isSaving: Вложения
  all: Всего
</i18n>

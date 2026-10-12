<script setup lang="ts">
import { formatByLocale } from '~~/utils/date/civil'

import type { WalletId, WalletItemComputed } from '~/components/wallets/types'

import { useLoansStore } from '~/components/loans/useLoansStore'

const props = defineProps<{
  wallet: WalletItemComputed
  walletId: WalletId
}>()

const dateLocale = useDateLocale()
const loansStore = useLoansStore()

const entry = computed(() => loansStore.byWalletId.get(props.walletId))

const loan = computed(() => {
  const found = entry.value
  if (!found)
    return null
  const next = found.summary.nextPayment
  return {
    isClosed: found.summary.isClosed,
    isOverdue: found.summary.overdueCount > 0,
    monthsLeft: found.summary.monthsLeft,
    nextDate: next ? formatByLocale(next.date, 'dd.MM', dateLocale.value) : null,
    payment: next?.amount ?? 0,
  }
})

const minPayment = computed(() => {
  const found = loansStore.minPaymentByWalletId.get(props.walletId)
  return found ? { ...found, date: formatByLocale(found.date, 'dd.MM', dateLocale.value) } : null
})
</script>

<template>
  <LoansCardLineView
    v-if="loan || minPayment"
    :currencyCode="props.wallet.currency"
    :loan
    :minPayment
  />
</template>

<script setup lang="ts">
import { formatByLocale, todayCivilDayEpoch } from '~~/utils/date/civil'

import type { WalletId, WalletItemComputed } from '~/components/wallets/types'

import { minPaymentOf } from '~/components/loans/minPayment'
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
  const unpaid = found.summary.rows.filter(row => row.status !== 'paid' && row.status !== 'late')
  const next = found.summary.nextPayment
  return {
    isClosed: found.summary.isClosed,
    isOverdue: found.summary.overdueCount > 0,
    monthsLeft: unpaid.length,
    nextDate: next ? formatByLocale(next.date, 'dd.MM', dateLocale.value) : null,
    payment: next?.amount ?? 0,
    until: unpaid.at(-1) ? formatByLocale(unpaid.at(-1)!.date, 'MM.yyyy', dateLocale.value) : '',
  }
})

const minPayment = computed(() => {
  const found = minPaymentOf(props.wallet, loansStore.trnsByCreditWallet.get(props.walletId) ?? [], todayCivilDayEpoch())
  return found && { ...found, date: formatByLocale(found.date, 'dd.MM', dateLocale.value) }
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

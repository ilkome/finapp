<script setup lang="ts">
import type { DueMonth } from '~/components/loans/engine/derive'
import type { LoansUpcomingViewGroup } from '~/components/loans/UpcomingView.vue'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { toUpcomingViewItem } from '~/components/loans/upcomingGroups'
import { useLoansStore } from '~/components/loans/useLoansStore'
import { monthlyInterest } from '~/components/wallets/analytics/forecast'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  due: DueMonth
  title: string
}>()

const emit = defineEmits<{
  closed: []
}>()

const { t } = useI18n()
const walletsStore = useWalletsStore()
const loansStore = useLoansStore()
const currenciesStore = useCurrenciesStore()
const { toBase } = currenciesStore

function sumOf(items: { amount: number, currency: string }[]) {
  return Math.round(items.reduce((total, item) => total + toBase(item.amount, item.currency), 0))
}

// The first month of the forecast's minimum path: interest on the whole card debt left after the minimum.
const minimumInterest = computed(() => {
  let total = 0
  for (const item of props.due.items) {
    if (item.kind !== 'card')
      continue
    const rate = loansStore.cardRateByWalletId.get(item.walletId) ?? null
    const debt = Math.max(0, -(walletsStore.itemsComputed[item.walletId]?.amount ?? 0))
    total += toBase(monthlyInterest(debt, rate), item.currency)
  }
  return Math.round(total)
})

const cards = computed(() => {
  const loans = props.due.items.filter(item => item.kind === 'loan')
  const mins = props.due.items.filter(item => item.kind === 'card' && !item.isGrace)
  const { amount, noInterestAmount } = props.due
  return [
    noInterestAmount !== amount ? { amount: noInterestAmount, title: t('loans.dueSheet.grace') } : null,
    { amount: props.due.amount, title: t('loans.dueSheet.total') },
    minimumInterest.value ? { amount: minimumInterest.value, title: t('loans.dueSheet.minimumInterest') } : null,
    loans.length && mins.length ? { amount: sumOf(loans), title: t('loans.dueSheet.loans') } : null,
    mins.length ? { amount: sumOf(mins), title: t('loans.dueSheet.minPayments') } : null,
  ].filter(card => card !== null)
})

const groups = computed<LoansUpcomingViewGroup[]>(() => {
  const days: LoansUpcomingViewGroup['days'] = []
  for (const item of props.due.noInterestItems) {
    const wallet = walletsStore.items?.[item.walletId]
    if (!wallet)
      continue
    let day = days.at(-1)
    if (day?.date !== item.date) {
      day = { date: item.date, items: [], sum: null }
      days.push(day)
    }
    day.items.push(toUpcomingViewItem(item, wallet, t))
  }
  for (const day of days)
    day.sum = day.items.length > 1 ? sumOf(day.items.map(item => ({ amount: item.amount, currency: item.currencyCode }))) : null
  return days.length ? [{ days, key: 'nearest', label: '' }] : []
})

function onSelect(walletId: string) {
  emit('closed')
  navigateTo(`/wallets/${walletId}`)
}
</script>

<template>
  <UiSheet :title="props.title" :collapsedSnap="500" @closed="emit('closed')">
    <div class="grid content-start gap-4 pb-32 md:pb-4" data-loan-due-sheet>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] gap-2">
        <StatSumItemView
          v-for="card in cards"
          :key="card.title"
          :amount="card.amount"
          :currencyCode="currenciesStore.base"
          :title="card.title"
          type="net"
          variant="summary"
        />
      </div>

      <LoansUpcomingView
        :baseCurrencyCode="currenciesStore.base"
        :groups
        :openKeys="[]"
        :isOverdue="false"
        :total="null"
        @select="onSelect"
      />
    </div>
  </UiSheet>
</template>

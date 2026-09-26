<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { formatByLocale } from '~~/utils/date/civil'

import type { CurrencyCode } from '~/components/currencies/types'
import type { PortfolioLoan } from '~/components/loans/engine/portfolio'
import type { LoansPortfolioViewItem } from '~/components/loans/PortfolioView.vue'
import type { LoansRecommendationPick } from '~/components/loans/RecommendationView.vue'
import type { LoansRevolvingViewItem } from '~/components/loans/RevolvingView.vue'
import type { WalletId } from '~/components/wallets/types'

import { getAmountInRate } from '~/components/amount/getTotal'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { paramsOf, projectionParams } from '~/components/loans/engine/derive'
import { derivePortfolio } from '~/components/loans/engine/portfolio'
import { minPaymentOf } from '~/components/loans/minPayment'
import { useLoansStore } from '~/components/loans/useLoansStore'
import { filterWalletsByViewType } from '~/components/wallets/filters'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useCivilToday } from '~/composables/useCivilToday'

const { t } = useI18n()
const dateLocale = useDateLocale()
const today = useCivilToday()
const loansStore = useLoansStore()
const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()

useSeoMeta({
  ogTitle: t('loans.page.title'),
  title: t('loans.page.title'),
})

const day = (ms: number) => formatByLocale(ms, 'dd.MM.yyyy', dateLocale.value)
const month = (ms: number) => formatByLocale(ms, 'MM.yyyy', dateLocale.value)

function toBase(amount: number, currencyCode: CurrencyCode) {
  return getAmountInRate({ amount, baseCurrencyCode: currenciesStore.base, currencyCode, rates: currenciesStore.rates })
}

// The same conversion read the other way round: base -> the loan's own currency.
function fromBase(amount: number, currencyCode: CurrencyCode) {
  return getAmountInRate({ amount, baseCurrencyCode: currencyCode, currencyCode: currenciesStore.base, rates: currenciesStore.rates })
}

/** Wallets that can pay a loan off: liquid, still in use, and not a credit product themselves. */
const freeMoneyWalletIds = computed<WalletId[]>(() =>
  filterWalletsByViewType(walletsStore.sortedIds, walletsStore.itemsComputed, 'isWithdrawal')
    .filter(id => walletsStore.itemsComputed[id]?.type !== 'credit'))

// An empty list means "all of them", so a fresh user gets a sensible default without a write.
const pickedWalletIds = useStorage<WalletId[]>('loans.recommendation.walletIds', [])
const selectedWalletIds = computed<WalletId[]>(() => {
  const picked = new Set(pickedWalletIds.value)
  return picked.size === 0 ? freeMoneyWalletIds.value : freeMoneyWalletIds.value.filter(id => picked.has(id))
})

// An overdrawn wallet cannot pay anything off, so it counts as zero rather than eating the others.
const freeMoney = computed(() => selectedWalletIds.value.reduce((total, id) => {
  const wallet = walletsStore.itemsComputed[id]
  return wallet ? total + Math.max(0, toBase(wallet.amount, wallet.currency)) : total
}, 0))

const extraInput = ref<number | null>(null)
const extra = computed(() => extraInput.value ?? Math.max(0, Math.round(freeMoney.value)))

const loans = computed<PortfolioLoan[]>(() => [...loansStore.byWalletId].map(([walletId, { loan, summary }]) => ({
  annualRate: loan.annualRate,
  cost: loansStore.costByWalletId.get(walletId) ?? { byMonth: [], fine: 0, interest: 0 },
  currency: walletsStore.items?.[walletId]?.currency ?? currenciesStore.base,
  name: walletsStore.items?.[walletId]?.name ?? '',
  params: projectionParams(loan, summary) ?? paramsOf(loan),
  summary,
  walletId,
})))

const portfolio = computed(() => derivePortfolio({ extra: extra.value, fromBase, loans: loans.value, toBase, today: today.value }))

const portfolioItems = computed<LoansPortfolioViewItem[]>(() => portfolio.value.items.map(item => ({
  contractRate: item.contractRate,
  currencyCode: item.currency,
  effectiveRate: item.effectiveRate,
  interestShareOfPortfolio: item.interestShareOfPortfolio,
  isClosed: item.isClosed,
  name: item.name,
  nextPayment: item.nextPayment && { amount: item.nextPayment.amount, date: day(item.nextPayment.date) },
  overdueCount: item.overdueCount,
  plannedEndDate: item.plannedEndDate === null ? null : day(item.plannedEndDate),
  remaining: item.remaining,
  walletId: item.walletId,
})))

const costProps = computed(() => ({
  byMonth: portfolio.value.interestByMonth.map(item => ({ fine: item.fine, interest: item.interest, month: month(item.month) })),
  currencyCode: currenciesStore.base,
  fine: portfolio.value.totals.paidFine,
  interest: portfolio.value.totals.paidInterest,
}))

function pickOf(walletId: WalletId, interestSaved: number, newEndDate: number | null): LoansRecommendationPick {
  return {
    interestSaved,
    name: walletsStore.items?.[walletId]?.name ?? '',
    newEndDate: newEndDate === null ? null : day(newEndDate),
    walletId,
  }
}

const recommendationProps = computed(() => {
  const found = portfolio.value.recommendation
  return {
    avalanche: found ? pickOf(found.avalanche.walletId, found.avalanche.interestSaved, found.avalanche.newEndDate) : null,
    baseCurrencyCode: currenciesStore.base,
    extra: extra.value,
    freeMoney: freeMoney.value,
    snowball: found ? pickOf(found.snowball.walletId, found.snowball.interestSaved, found.snowball.newEndDate) : null,
    wallets: freeMoneyWalletIds.value.map((id) => {
      const wallet = walletsStore.itemsComputed[id]
      return {
        amount: wallet?.amount ?? 0,
        currencyCode: wallet?.currency ?? currenciesStore.base,
        isSelected: selectedWalletIds.value.includes(id),
        name: wallet?.name ?? '',
        walletId: id,
      }
    }),
  }
})

/** Credit wallets with no `loans` row: cards and instalment limits, not amortized loans. */
const revolvingItems = computed<LoansRevolvingViewItem[]>(() => walletsStore.sortedIds.flatMap((walletId) => {
  const wallet = walletsStore.itemsComputed[walletId]
  if (!wallet || wallet.type !== 'credit' || wallet.isArchived || loansStore.loanIdByWalletId.has(walletId))
    return []

  const cost = loansStore.costByWalletId.get(walletId) ?? { byMonth: [], fine: 0, interest: 0 }
  const minPayment = minPaymentOf(wallet, loansStore.trnsByCreditWallet.get(walletId) ?? [], today.value)

  return [{
    byMonth: cost.byMonth.map(item => ({ fine: item.fine, interest: item.interest, month: month(item.month) })),
    currencyCode: wallet.currency,
    debt: Math.abs(wallet.amount),
    fine: cost.fine,
    interest: cost.interest,
    minPayment: minPayment && { ...minPayment, date: formatByLocale(minPayment.date, 'dd.MM', dateLocale.value) },
    name: wallet.name,
    walletId,
  }]
}))

function onToggleWallet(walletId: WalletId) {
  const next = new Set(selectedWalletIds.value)
  if (next.has(walletId))
    next.delete(walletId)
  else next.add(walletId)
  // All of them selected again is the default, stored as an empty list.
  pickedWalletIds.value = next.size === freeMoneyWalletIds.value.length ? [] : [...next]
}
</script>

<template>
  <UiPage>
    <UiHeader compactBottom>
      <UiHeaderTitle>{{ t('loans.page.title') }}</UiHeaderTitle>
    </UiHeader>

    <div class="grid max-w-5xl grow content-start gap-6 px-2 pb-6 lg:px-4 2xl:px-8 @xl/page:grid-cols-2 @xl/page:gap-8">
      <div class="grid content-start gap-6 @3xl/main:max-w-sm">
        <LoansDueThisMonth />
        <LoansPortfolioView
          :baseCurrencyCode="currenciesStore.base"
          :items="portfolioItems"
          :totals="portfolio.totals"
        />
        <LoansCostView v-if="costProps.byMonth.length" v-bind="costProps" />
      </div>

      <div class="grid content-start gap-6 @3xl/main:max-w-sm">
        <LoansRecommendationView
          v-bind="recommendationProps"
          @toggleWallet="onToggleWallet"
          @update:extra="(value: number) => extraInput = value"
        />
        <LoansRevolvingView :items="revolvingItems" />
      </div>
    </div>
  </UiPage>
</template>

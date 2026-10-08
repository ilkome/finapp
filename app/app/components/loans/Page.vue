<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { formatByLocale } from '~~/utils/date/civil'

import type { CurrencyCode } from '~/components/currencies/types'
import type { PortfolioLoan } from '~/components/loans/engine/portfolio'
import type { LoansPortfolioViewItem } from '~/components/loans/PortfolioView.vue'
import type { LoansRecommendationPick } from '~/components/loans/RecommendationView.vue'
import type { LoansRevolvingViewItem } from '~/components/loans/RevolvingView.vue'
import type { LoansUpcomingViewGroup } from '~/components/loans/UpcomingView.vue'
import type { TrnItemFull } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { getAmountInRate } from '~/components/amount/getTotal'
import { useAmount } from '~/components/amount/useAmount'
import { formatAmount } from '~/components/amount/utils'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { incomeWindow, debtToIncome as toDebtToIncome } from '~/components/loans/debtToIncome'
import { paramsOf, projectionParams } from '~/components/loans/engine/derive'
import { derivePortfolio } from '~/components/loans/engine/portfolio'
import { minPaymentOf } from '~/components/loans/minPayment'
import { shownEffectiveRate } from '~/components/loans/presenters'
import { groupUpcoming } from '~/components/loans/upcomingGroups'
import { useLoansStore } from '~/components/loans/useLoansStore'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { filterWalletsByViewType } from '~/components/wallets/filters'
import { isCreditProduct } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useCivilToday } from '~/composables/useCivilToday'

const { t } = useI18n()
const dateLocale = useDateLocale()
const today = useCivilToday()
const loansStore = useLoansStore()
const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()
const { computeTotalForTrnsIds } = useAmount()

useSeoMeta({
  ogTitle: t('loans.page.title'),
  title: t('loans.page.title'),
})

const day = (ms: number) => formatByLocale(ms, 'dd.MM.yyyy', dateLocale.value)
const month = (ms: number) => formatByLocale(ms, 'LLL yyyy', dateLocale.value)

function toBase(amount: number, currencyCode: CurrencyCode) {
  return getAmountInRate({ amount, baseCurrencyCode: currenciesStore.base, currencyCode, rates: currenciesStore.rates })
}

// The same conversion read the other way round: base -> the loan's own currency.
function fromBase(amount: number, currencyCode: CurrencyCode) {
  return getAmountInRate({ amount, baseCurrencyCode: currencyCode, currencyCode: currenciesStore.base, rates: currenciesStore.rates })
}

/**
 * Wallets that can pay a loan off: liquid, still in use, not a credit product themselves, and with
 * money on them - an overdrawn wallet would only count as zero.
 */
const freeMoneyWalletIds = computed<WalletId[]>(() =>
  filterWalletsByViewType(walletsStore.sortedIds, walletsStore.itemsComputed, 'isWithdrawal')
    .filter((id) => {
      const wallet = walletsStore.itemsComputed[id]
      return !isCreditProduct(wallet?.type) && (wallet?.amount ?? 0) > 0
    }))

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

// Starts at 0: all free money would close every loan today and make the picks meaningless.
const extra = useStorage('loans.recommendation.extra', 0)

const loans = computed<PortfolioLoan[]>(() => [...loansStore.byWalletId].map(([walletId, { loan, summary }]) => ({
  annualRate: loan.annualRate,
  cost: loansStore.costByWalletId.get(walletId) ?? { byMonth: [], fine: 0, interest: 0 },
  currency: walletsStore.items?.[walletId]?.currency ?? currenciesStore.base,
  name: walletsStore.items?.[walletId]?.name ?? '',
  params: projectionParams(loan, summary) ?? paramsOf(loan),
  summary,
  walletId,
})))

const portfolio = computed(() => derivePortfolio({ extra: extra.value, fromBase, loans: loans.value, toBase }))

const portfolioItems = computed<LoansPortfolioViewItem[]>(() => portfolio.value.items.map(item => ({
  contractRate: item.contractRate,
  currencyCode: item.currency,
  // 0 means nothing settled yet, not a free loan.
  effectiveRate: item.effectiveRate > 0 ? shownEffectiveRate(item.contractRate, item.effectiveRate) : null,
  isClosed: item.isClosed,
  name: item.name,
  nextPayment: item.nextPayment && { amount: item.nextPayment.amount, date: day(item.nextPayment.date) },
  overdueCount: item.overdueCount,
  period: item.closedDate === null ? null : `${day(item.startDate)} - ${day(item.closedDate)}`,
  plannedEndDate: item.plannedEndDate === null ? null : day(item.plannedEndDate),
  remaining: item.remaining,
  walletId: item.walletId,
})))

/** Credit cards and instalment limits, not amortized loans. */
const revolvingWalletIds = computed(() => walletsStore.sortedIds.filter((walletId) => {
  const wallet = walletsStore.itemsComputed[walletId]
  return wallet?.type === 'credit' && !wallet.isArchived
}))

// The page-wide cost covers every credit product: the cards' interest and fines join the loans'.
const costProps = computed(() => {
  const byMonth = new Map(portfolio.value.interestByMonth.map(item => [item.month, { fine: item.fine, interest: item.interest }]))
  let fine = portfolio.value.totals.paidFine
  let interest = portfolio.value.totals.paidInterest

  for (const walletId of revolvingWalletIds.value) {
    const cost = loansStore.costByWalletId.get(walletId)
    const currency = walletsStore.items?.[walletId]?.currency ?? currenciesStore.base
    if (!cost)
      continue
    fine += toBase(cost.fine, currency)
    interest += toBase(cost.interest, currency)
    for (const item of cost.byMonth) {
      const bucket = byMonth.get(item.month) ?? { fine: 0, interest: 0 }
      bucket.fine += toBase(item.fine, currency)
      bucket.interest += toBase(item.interest, currency)
      byMonth.set(item.month, bucket)
    }
  }

  return {
    byMonth: [...byMonth].sort(([a], [b]) => a - b).map(([ms, item]) => ({ fine: item.fine, interest: item.interest, month: month(ms) })),
    currencyCode: currenciesStore.base,
    fine,
    interest,
  }
})

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

const revolvingItems = computed<LoansRevolvingViewItem[]>(() => revolvingWalletIds.value.flatMap((walletId) => {
  const wallet = walletsStore.itemsComputed[walletId]!

  const cost = loansStore.costByWalletId.get(walletId) ?? { byMonth: [], fine: 0, interest: 0 }
  const minPayment = minPaymentOf(wallet, loansStore.trnsByCreditWallet.get(walletId) ?? [], today.value)

  return [{
    currencyCode: wallet.currency,
    debt: Math.abs(wallet.amount),
    fine: cost.fine,
    interest: cost.interest,
    minPayment: minPayment && { ...minPayment, date: formatByLocale(minPayment.date, 'dd.MM', dateLocale.value) },
    name: wallet.name,
    walletId,
  }]
}))

const upcomingGroups = computed<LoansUpcomingViewGroup[]>(() => {
  const categoryOf = (kind: 'card' | 'loan') => ({ color: '', icon: 'mdi:calendar-clock', name: t(kind === 'card' ? 'loans.toPay.minPayment' : 'loans.toPay.payment'), parentId: 0 as const, showInLastUsed: false, showInQuickSelector: false })

  return groupUpcoming(loansStore.upcoming, today.value, toBase).flatMap((group) => {
    return [{
      days: group.days.map(({ date, items, sum }) => ({
        date,
        items: items.flatMap((item) => {
          const wallet = walletsStore.items?.[item.walletId]
          if (!wallet)
            return []
          const desc = item.principal === undefined || item.interest === undefined
            ? undefined
            : `${t('loans.principal')} ${formatAmount(item.principal, wallet.currency)} · ${t('loans.interest')} ${formatAmount(item.interest, wallet.currency)}`
          const trnItem: TrnItemFull = {
            amount: item.amount,
            category: categoryOf(item.kind),
            categoryId: 'loanPayment',
            date,
            desc,
            id: `upcoming:${item.walletId}`,
            type: TrnType.Expense,
            updatedAt: date,
            wallet,
            walletId: item.walletId,
          }
          return [{ trnItem, walletId: item.walletId }]
        }),
        sum,
      })),
      key: group.key,
      label: group.key === 'nearest' ? '' : t(`loans.toPay.${group.key}`),
    }]
  })
})

const dueThisMonth = computed(() => loansStore.dueThisMonth)

const debtToIncome = computed(() => {
  const income = computeTotalForTrnsIds(trnsStore.getStoreTrnsIds({ dates: incomeWindow(today.value) })).income
  const payments = loansStore.upcoming.reduce((total, item) => total + toBase(item.amount, item.currency), 0)
  return toDebtToIncome(payments, income)
})

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
    <UiHeader>
      <UiHeaderTitle>{{ t('loans.page.title') }}</UiHeaderTitle>
    </UiHeader>

    <div class="grid max-w-5xl grow content-start gap-6 px-2 pb-6 lg:px-4 2xl:px-8 @xl/page:grid-cols-2 @xl/page:gap-8">
      <div class="grid content-start gap-6 @3xl/main:max-w-sm">
        <LoansUpcomingView
          :baseCurrencyCode="currenciesStore.base"
          :groups="upcomingGroups"
          :isOverdue="!!dueThisMonth && dueThisMonth.nearestDate < today"
          :total="dueThisMonth?.amount ?? null"
          @select="(walletId: string) => navigateTo(`/wallets/${walletId}`)"
        />
        <LoansPortfolioView
          :baseCurrencyCode="currenciesStore.base"
          :debtToIncome
          :items="portfolioItems"
          :totals="portfolio.totals"
        />
        <LoansRevolvingView :items="revolvingItems" />
      </div>

      <div class="grid content-start gap-6 @3xl/main:max-w-sm">
        <LoansCostView v-if="costProps.byMonth.length" v-bind="costProps" />
        <LoansRecommendationView
          v-bind="recommendationProps"
          @toggleWallet="onToggleWallet"
          @update:extra="(value: number) => extra = value"
        />
      </div>
    </div>
  </UiPage>
</template>

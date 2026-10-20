<script setup lang="ts">
import { formatByLocale } from '~~/utils/date/civil'

import type { SummaryTile } from '~/components/wallets/analytics/SummaryTilesView.vue'
import type { AnalyticsBase } from '~/components/wallets/analytics/useAnalyticsBase'

import { formatAmount } from '~/components/amount/utils'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useLoansStore } from '~/components/loans/useLoansStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { creditUtilization } from '~/components/wallets/analytics/debts'
import { formatPercent } from '~/components/wallets/analytics/tooltips'
import { isCreditProduct } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  base: AnalyticsBase
}>()

const { t } = useI18n()
const walletsStore = useWalletsStore()
const trnsStore = useTrnsStore()
const loansStore = useLoansStore()
const currenciesStore = useCurrenciesStore()
const dateLocale = useDateLocale()

const creditIds = computed(() => props.base.walletIds.value.filter(id => isCreditProduct(walletsStore.items?.[id]?.type)))
const debtOf = (id: string) => Math.max(0, -(walletsStore.itemsComputed[id]?.amount ?? 0))

const totalDebt = computed(() => Math.round(creditIds.value.reduce((sum, id) => sum + currenciesStore.toBase(debtOf(id), walletsStore.currencyOf(id)), 0)))

// Interest and fines are ordinary expenses in reserved categories; the period's ones by its rates.
const interestPaid = computed(() => {
  const ids = trnsStore.getStoreTrnsIds({ dates: props.base.range.value, walletsIds: props.base.walletIds.value })
  const items = trnsStore.items ?? {}
  return Math.round(ids.reduce((sum, id) => {
    const trn = items[id]
    if (trn?.type !== 'expense' || (trn.categoryId !== 'loan_interest' && trn.categoryId !== 'loan_fine') || !trn.fromWalletId)
      return sum
    const index = props.base.intervals.value.findIndex(interval => trn.date <= interval.end)
    return sum + props.base.toBaseAt(index)(trn.fromAmount ?? 0, walletsStore.currencyOf(trn.fromWalletId))
  }, 0))
})

const nearestPayoff = computed(() => {
  let best: { date: number, name: string } | null = null
  for (const [walletId, { summary }] of loansStore.byWalletId) {
    const date = summary.plannedEndDate
    if (summary.isClosed || date === null || walletsStore.items?.[walletId]?.isArchived)
      continue
    if (!best || date < best.date)
      best = { date, name: walletsStore.items?.[walletId]?.name ?? walletId }
  }
  return best
})

const utilization = computed(() => creditUtilization(creditIds.value
  .filter(id => walletsStore.items?.[id]?.type === 'credit_card')
  .map(id => ({ debt: currenciesStore.toBase(debtOf(id), walletsStore.currencyOf(id)), id, limit: walletsStore.items?.[id]?.creditLimit && currenciesStore.toBase(walletsStore.items[id]!.creditLimit!, walletsStore.currencyOf(id)) }))))

const tiles = computed<SummaryTile[]>(() => {
  const money = (value: number) => formatAmount(Math.round(value), currenciesStore.base)
  const { items, total } = utilization.value
  return [
    { amount: -totalDebt.value, id: 'debt', label: t('wallets.analytics.debts.total') },
    { amount: interestPaid.value, id: 'interest', label: t('wallets.analytics.debts.interest') },
    ...(nearestPayoff.value
      ? [{ caption: nearestPayoff.value.name, id: 'payoff', label: t('wallets.analytics.debts.payoff'), text: formatByLocale(nearestPayoff.value.date, 'd MMM yyyy', dateLocale.value) }]
      : []),
    ...(total
      ? [{ caption: `${money(total.debt)} / ${money(total.limit)}`, id: 'utilization', isWarning: total.isWarning, label: t('wallets.analytics.debts.utilization'), text: formatPercent(total.share) }]
      : []),
    ...(items.length > 1
      ? items.map(item => ({ caption: `${money(item.debt)} / ${money(item.limit)}`, id: `card-${item.id}`, isWarning: item.isWarning, label: walletsStore.items?.[item.id]?.name ?? item.id, text: formatPercent(item.share) }))
      : []),
  ]
})
</script>

<template>
  <section v-if="creditIds.length" class="grid min-w-0 content-start gap-3" data-analytics-debts>
    <div class="flex items-center gap-2">
      <UiTitleSection class="grow">
        {{ t('wallets.analytics.debts.title') }}
      </UiTitleSection>
      <UButton to="/loans" color="neutral" variant="link" size="sm" trailingIcon="lucide:chevron-right">
        {{ t('wallets.analytics.debts.open') }}
      </UButton>
    </div>

    <WalletsAnalyticsSummaryTilesView :currencyCode="currenciesStore.base" :items="tiles" />
  </section>
</template>

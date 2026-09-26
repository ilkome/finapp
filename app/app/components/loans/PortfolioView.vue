<script setup lang="ts">
export type LoansPortfolioViewItem = {
  contractRate: number | null
  currencyCode: string
  effectiveRate: number
  /** Share of this loan in the portfolio's paid plus planned interest, 0..1. */
  interestShareOfPortfolio: number
  isClosed: boolean
  name: string
  /** Amount in the loan's own currency plus a preformatted civil day. */
  nextPayment: { amount: number, date: string } | null
  overdueCount: number
  /** Preformatted civil day, null when the schedule is over. */
  plannedEndDate: string | null
  remaining: number
  walletId: string
}

const props = defineProps<{
  baseCurrencyCode: string
  items: LoansPortfolioViewItem[]
  totals: {
    paidFine: number
    paidInterest: number
    paidTotal: number
    plannedInterest: number
    remaining: number
  }
}>()

const { t } = useI18n()

const cells = computed(() => [
  { key: 'remaining', title: t('loans.portfolio.remaining'), value: props.totals.remaining },
  { key: 'paidTotal', title: t('loans.paidTotal'), value: props.totals.paidTotal },
  { key: 'paidInterest', title: t('loans.paidInterest'), value: props.totals.paidInterest },
  { key: 'plannedInterest', title: t('loans.plannedInterest'), value: props.totals.plannedInterest },
])
</script>

<template>
  <div class="grid gap-2">
    <UiText variant="section">
      {{ t('loans.portfolio.title') }}
    </UiText>

    <div class="grid grid-cols-2 gap-2">
      <div
        v-for="cell in cells"
        :key="cell.key"
        class="rounded-sm bg-elevated/30 px-3 py-2"
        :data-loan-total="cell.key"
      >
        <UiText variant="caption">
          {{ cell.title }}
        </UiText>
        <Amount
          :amount="cell.value"
          :currencyCode="props.baseCurrencyCode"
          :isShowBaseRate="false"
          align="left"
          variant="summary"
        />
      </div>
    </div>

    <UiText v-if="props.items.length === 0" variant="meta">
      {{ t('loans.portfolio.empty') }}
    </UiText>

    <NuxtLink
      v-for="item in props.items"
      :key="item.walletId"
      :to="`/wallets/${item.walletId}`"
      class="border-elevated/40 grid gap-1 border-b py-2 last:border-0"
      data-loan-portfolio-item
    >
      <div class="flex flex-wrap items-baseline gap-2">
        <UiText variant="navigation">
          {{ item.name }}
        </UiText>

        <span
          v-if="item.isClosed"
          class="rounded-sm bg-elevated/60 px-2 py-0.5 text-2xs leading-4 text-muted"
        >
          {{ t('loans.closed') }}
        </span>

        <span
          v-if="item.overdueCount > 0"
          class="rounded-sm bg-error/15 px-2 py-0.5 text-2xs leading-4 text-error"
        >
          {{ t('loans.overdue') }}: {{ item.overdueCount }}
        </span>

        <Amount
          :amount="item.remaining"
          :currencyCode="item.currencyCode"
          :isShowBaseRate="false"
          class="ml-auto"
          align="left"
          variant="secondary"
        />
      </div>

      <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <UiText variant="meta">
          {{ t('loans.effectiveRate') }}: {{ item.effectiveRate }}%{{ item.contractRate === null ? '' : ` / ${item.contractRate}%` }}
        </UiText>

        <UiText variant="meta">
          {{ t('loans.portfolio.interestShare') }}: {{ Math.round(item.interestShareOfPortfolio * 100) }}%
        </UiText>

        <UiText v-if="item.plannedEndDate" variant="meta">
          → {{ item.plannedEndDate }}
        </UiText>
      </div>

      <div v-if="item.nextPayment" class="flex items-baseline gap-2">
        <UiText variant="meta">
          {{ t('loans.nextPayment') }}
        </UiText>
        <Amount
          :amount="item.nextPayment.amount"
          :currencyCode="item.currencyCode"
          :isShowBaseRate="false"
          align="left"
          variant="secondary"
        />
        <UiText variant="meta">
          {{ item.nextPayment.date }}
        </UiText>
      </div>
    </NuxtLink>
  </div>
</template>

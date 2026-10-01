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
    <UiTitleSection>
      {{ t('loans.portfolio.title') }}
    </UiTitleSection>

    <div class="grid grid-cols-2 gap-2">
      <LoansStatCell
        v-for="cell in cells"
        :key="cell.key"
        :amount="cell.value"
        :currencyCode="props.baseCurrencyCode"
        :data-loan-total="cell.key"
        :isShowBaseRate="false"
        :title="cell.title"
      />
    </div>

    <UiText v-if="props.items.length === 0" variant="meta">
      {{ t('loans.portfolio.empty') }}
    </UiText>

    <UiElement
      v-for="(item, index) in props.items"
      :key="item.walletId"
      :lineWidth="index === props.items.length - 1 ? 0 : 3"
      :to="`/wallets/${item.walletId}`"
      data-loan-portfolio-item
      insideClasses="items-start"
    >
      <div class="grid min-w-0 grow gap-1">
        <div class="flex flex-wrap items-baseline gap-2">
          <UiText variant="navigation">
            {{ item.name }}
          </UiText>

          <UiBadge
            v-if="item.isClosed"
            tone="muted"
          >
            {{ t('loans.closed') }}
          </UiBadge>

          <UiBadge
            v-if="item.overdueCount > 0"
            tone="error"
          >
            {{ t('loans.overdue') }}: {{ item.overdueCount }}
          </UiBadge>

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
          <!-- 0 means nothing settled yet, not a free loan: the contract rate alone stands in. -->
          <UiText v-if="item.effectiveRate > 0" variant="meta">
            {{ t('loans.effectiveRate') }}: {{ item.effectiveRate }}%{{ item.contractRate === null ? '' : ` / ${item.contractRate}%` }}
          </UiText>
          <UiText v-else-if="item.contractRate !== null" variant="meta">
            {{ t('loans.contractRate') }}: {{ item.contractRate }}%
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
      </div>
    </UiElement>
  </div>
</template>

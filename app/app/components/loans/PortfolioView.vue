<script setup lang="ts">
export type LoansPortfolioViewItem = {
  contractRate: number | null
  currencyCode: string
  /** Rate the paid interest amounts to; null when it says nothing the contract rate does not. */
  effectiveRate: number | null
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

const isShowClosed = ref(false)

const cells = computed(() => [
  { key: 'remaining', title: t('loans.portfolio.remaining'), value: props.totals.remaining },
  { key: 'paidTotal', title: t('loans.paidTotal'), value: props.totals.paidTotal },
  { key: 'paidInterest', title: t('loans.paidInterest'), value: props.totals.paidInterest },
  { key: 'plannedInterest', title: t('loans.plannedInterest'), value: props.totals.plannedInterest },
])

const openItems = computed(() => props.items.filter(item => !item.isClosed))
const closedItems = computed(() => props.items.filter(item => item.isClosed))
const shownItems = computed(() => isShowClosed.value ? [...openItems.value, ...closedItems.value] : openItems.value)
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

    <div class="grid">
      <UiElement
        v-for="(item, index) in shownItems"
        :key="item.walletId"
        :lineWidth="index === shownItems.length - 1 ? 0 : 3"
        :to="`/wallets/${item.walletId}`"
        data-loan-portfolio-item
        insideClasses="items-start"
      >
        <div class="grid min-w-0 grow gap-0.5">
          <div class="flex items-baseline gap-2">
            <UiText variant="navigation" class="truncate">
              {{ item.name }}
            </UiText>

            <UiBadge v-if="item.isClosed" tone="muted">
              {{ t('loans.closed') }}
            </UiBadge>

            <UiBadge v-if="item.overdueCount > 0" tone="error">
              {{ t('loans.overdue') }}: {{ item.overdueCount }}
            </UiBadge>

            <Amount
              :amount="item.remaining"
              :currencyCode="item.currencyCode"
              :isShowBaseRate="false"
              class="ml-auto"
              variant="secondary"
            />
          </div>

          <div v-if="item.nextPayment" class="flex flex-wrap items-baseline gap-x-1.5">
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

          <div class="flex flex-wrap items-baseline gap-x-1.5">
            <UiText v-if="item.contractRate !== null" variant="meta">
              {{ item.contractRate }}%
            </UiText>
            <UiText v-if="item.effectiveRate !== null" variant="meta" data-loan-rate="effective">
              {{ t('loans.effectiveRateHint', { rate: item.effectiveRate }) }}
            </UiText>
            <UiText v-if="item.plannedEndDate" variant="meta">
              {{ t('loans.by') }} {{ item.plannedEndDate }}
            </UiText>
          </div>
        </div>
      </UiElement>
    </div>

    <button
      v-if="closedItems.length > 0"
      type="button"
      class="justify-self-start text-xs text-muted"
      data-loan-show-closed
      @click="isShowClosed = !isShowClosed"
    >
      {{ isShowClosed ? t('loans.showLess') : t('loans.portfolio.showClosed', { n: closedItems.length }) }}
    </button>
  </div>
</template>

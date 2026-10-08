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
  /** Preformatted "opened - closed" days of a closed loan; null while it is open. */
  period: string | null
  /** Preformatted civil day, null when the schedule is over. */
  plannedEndDate: string | null
  remaining: number
  walletId: string
}

const props = defineProps<{
  baseCurrencyCode: string
  /** Monthly loan and card payments in the base currency against the average monthly income; null without income. */
  debtToIncome?: { payments: number, share: number } | null
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

    <div v-if="props.debtToIncome" class="flex flex-wrap items-baseline gap-x-1.5 px-1" data-loan-dti>
      <UiText variant="caption">
        {{ t('loans.portfolio.payments') }}
      </UiText>
      <Amount
        :amount="props.debtToIncome.payments"
        :currencyCode="props.baseCurrencyCode"
        :isShowBaseRate="false"
        align="left"
        variant="secondary"
      />
      <UiText variant="meta" :class="props.debtToIncome.share > 0.5 && 'text-error!'">
        · {{ t('loans.portfolio.ofIncome', { share: Math.round(props.debtToIncome.share * 100) }) }}
      </UiText>
    </div>

    <div v-if="props.items.length === 0" class="flex flex-wrap items-center gap-2" data-loan-portfolio-empty>
      <UiText variant="meta" class="grow">
        {{ t('loans.portfolio.empty') }}
      </UiText>
      <UButton
        color="neutral"
        icon="i-lucide-landmark"
        size="sm"
        to="/wallets/new?type=loan&returnBack=1"
        variant="soft"
      >
        {{ t('loans.add') }}
      </UButton>
    </div>

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
            <UiText v-if="item.plannedEndDate" variant="meta">
              {{ t('loans.by') }} {{ item.plannedEndDate }}
            </UiText>
            <UiText v-if="item.period" variant="meta" data-loan-period>
              {{ item.period }}
            </UiText>
          </div>

          <UiText v-if="item.effectiveRate !== null" variant="meta" class="text-dimmed!" data-loan-rate="effective">
            {{ t('loans.effectiveRateHint', { rate: item.effectiveRate }) }}
          </UiText>
        </div>
      </UiElement>
    </div>

    <UButton
      v-if="closedItems.length > 0"
      class="justify-self-start"
      color="neutral"
      size="xs"
      variant="link"
      data-loan-show-closed
      @click="isShowClosed = !isShowClosed"
    >
      {{ isShowClosed ? t('loans.showLess') : t('loans.portfolio.showClosed', { n: closedItems.length }) }}
    </UButton>
  </div>
</template>

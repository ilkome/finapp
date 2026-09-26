<script setup lang="ts">
const props = defineProps<{
  /**
   * The wallet against the debt the bank reports: `diff` is ours minus the bank's, 0 when they
   * match. Stale when a payment fell due after the bank figure. null until bank sync pushed one.
   */
  bankDebt: { date: string, diff: number, isStale: boolean } | null
  /** null: the bank publishes no contract rate. */
  contractRate: number | null
  currencyCode: string
  /** How much the debit wallet is short of the next payment; null when it covers it. */
  debitShortfall: number | null
  /** Rate the paid interest amounts to; null when it matches the contract rate. */
  effectiveRate: number | null
  /** Settled payments recorded without their interest expense. */
  interestMissing: number
  isClosed: boolean
  nextPayment: { amount: number, date: string } | null
  overdueCount: number
  /** Interest and fines paid so far. */
  overpaid: number
  /** `overpaid` as a share of the principal, 0..1. */
  overpaidShare: number
  paidTotal: number
  /** Preformatted civil day. */
  plannedEndDate: string | null
  plannedInterest: number
  /** Interest paid in the settled months that repaid no principal. */
  principalFreeInterest: number
  principalFreeMonths: number
  /** Gap between the wallet balance and the reconciled principal. 0 when the import matches. */
  unrecognized: number
}>()

const { t } = useI18n()

const percent = computed(() => `${Math.round(props.overpaidShare * 100)}%`)
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-center gap-2">
      <UiText variant="section">
        {{ t('loans.title') }}
      </UiText>

      <span
        v-if="props.isClosed"
        class="rounded-sm bg-elevated/60 px-2 py-0.5 text-2xs leading-4 text-muted"
      >
        {{ t('loans.closed') }}
      </span>

      <span
        v-if="props.overdueCount > 0"
        class="rounded-sm bg-error/15 px-2 py-0.5 text-2xs leading-4 text-error"
      >
        {{ t('loans.overdue') }}: {{ props.overdueCount }}
      </span>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <div class="rounded-sm bg-elevated/30 px-3 py-2">
        <UiText variant="caption">
          {{ t('loans.paidTotal') }}
        </UiText>
        <Amount
          :amount="props.paidTotal"
          :currencyCode="props.currencyCode"
          align="left"
          variant="summary"
        />
      </div>

      <div class="rounded-sm bg-elevated/30 px-3 py-2">
        <UiText variant="caption">
          {{ t('loans.overpaid') }} · {{ t('loans.ofPrincipal', { share: percent }) }}
        </UiText>
        <Amount
          :amount="props.overpaid"
          :currencyCode="props.currencyCode"
          align="left"
          variant="summary"
        />
      </div>
    </div>

    <div class="grid gap-1.5 rounded-sm bg-elevated/30 px-3 py-2">
      <div
        v-if="props.contractRate !== null || props.effectiveRate !== null"
        class="flex items-baseline justify-between gap-2"
      >
        <UiText variant="caption">
          {{ t('loans.contractRate') }}
        </UiText>
        <div class="flex items-baseline gap-2">
          <UiText v-if="props.effectiveRate !== null" variant="meta" data-loan-rate="effective">
            {{ t('loans.effectiveRateHint', { rate: props.effectiveRate }) }}
          </UiText>
          <UiText v-if="props.contractRate !== null" variant="navigation">
            {{ props.contractRate }}%
          </UiText>
        </div>
      </div>

      <div v-if="!props.isClosed" class="flex items-baseline justify-between gap-2">
        <UiText variant="caption">
          {{ t('loans.plannedOverpayment') }}
        </UiText>
        <div class="flex items-baseline gap-2">
          <Amount
            :amount="props.plannedInterest"
            :currencyCode="props.currencyCode"
            align="left"
            variant="secondary"
          />
          <UiText v-if="props.plannedEndDate" variant="meta">
            {{ props.plannedEndDate }}
          </UiText>
        </div>
      </div>

      <div v-if="props.nextPayment" class="flex items-baseline justify-between gap-2">
        <UiText variant="caption">
          {{ t('loans.nextPayment') }}
        </UiText>
        <div class="flex items-baseline gap-2">
          <Amount
            :amount="props.nextPayment.amount"
            :currencyCode="props.currencyCode"
            align="left"
            variant="secondary"
          />
          <UiText variant="meta">
            {{ props.nextPayment.date }}
          </UiText>
        </div>
      </div>
    </div>

    <div
      v-if="props.bankDebt"
      data-loan-bank-debt
      class="flex items-baseline justify-between gap-2 rounded-sm px-3 py-2"
      :class="[props.bankDebt.diff === 0 ? 'bg-elevated/30' : 'bg-warning/10', { 'opacity-60': props.bankDebt.isStale }]"
    >
      <UiText variant="caption">
        {{ props.bankDebt.diff === 0 ? t('loans.bankDebt.reconciled') : t('loans.bankDebt.off') }}
      </UiText>
      <div class="flex items-baseline gap-2">
        <Amount
          v-if="props.bankDebt.diff !== 0"
          :amount="props.bankDebt.diff"
          :currencyCode="props.currencyCode"
          align="left"
          variant="secondary"
        />
        <UiText variant="meta">
          {{ props.bankDebt.date }}
        </UiText>
      </div>
    </div>

    <div
      v-if="props.principalFreeMonths > 0"
      data-loan-warning="principalFree"
      class="flex items-baseline justify-between gap-2 rounded-sm bg-warning/10 px-3 py-2"
    >
      <UiText variant="caption">
        {{ t('loans.principalFree.summary', props.principalFreeMonths) }}
      </UiText>
      <Amount
        :amount="props.principalFreeInterest"
        :currencyCode="props.currencyCode"
        align="left"
        variant="secondary"
      />
    </div>

    <div
      v-if="props.interestMissing > 0"
      data-loan-warning="interestMissing"
      class="grid gap-1 rounded-sm bg-warning/10 px-3 py-2"
    >
      <UiText variant="navigation">
        {{ t('loans.interestMissing.summary', props.interestMissing) }}
      </UiText>
      <UiText variant="meta">
        {{ t('loans.interestMissing.hint') }}
      </UiText>
    </div>

    <div
      v-if="props.unrecognized !== 0"
      data-loan-warning="unrecognized"
      class="grid gap-1 rounded-sm bg-warning/10 px-3 py-2"
    >
      <UiText variant="navigation">
        {{ t('loans.unrecognized') }}: {{ props.unrecognized }}
      </UiText>
      <UiText variant="meta">
        {{ t('loans.unrecognizedHint') }}
      </UiText>
    </div>

    <div
      v-if="props.debitShortfall !== null"
      data-loan-warning="shortfall"
      class="grid gap-1 rounded-sm bg-error/10 px-3 py-2"
    >
      <UiText variant="navigation">
        {{ t('loans.notEnoughOnDebit') }}
      </UiText>
      <Amount
        :amount="props.debitShortfall"
        :currencyCode="props.currencyCode"
        align="left"
        variant="secondary"
      />
    </div>
  </div>
</template>

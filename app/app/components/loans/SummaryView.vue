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
  /** Unpaid payments left on the schedule. */
  monthsLeft: number
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
  /** The amount borrowed. */
  principalAmount: number
  /** Interest paid in the settled months that repaid no principal. */
  principalFreeInterest: number
  principalFreeMonths: number
  /** Debt left, as a positive number. */
  remaining: number
  /** Gap between the wallet balance and the reconciled principal. 0 when the import matches. */
  unrecognized: number
}>()

const emit = defineEmits<{
  pay: []
}>()

const { t } = useI18n()

const percent = computed(() => `${Math.round(props.overpaidShare * 100)}%`)
const repaid = computed(() => Math.max(0, Math.min(props.principalAmount, props.principalAmount - props.remaining)))
const repaidShare = computed(() => props.principalAmount > 0 ? repaid.value / props.principalAmount : 0)
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-center gap-2">
      <UiTitleSection>
        {{ t('loans.title') }}
      </UiTitleSection>

      <UiBadge v-if="props.isClosed" tone="muted">
        {{ t('loans.closed') }}
      </UiBadge>

      <UiBadge v-if="props.overdueCount > 0" tone="error">
        {{ t('loans.overdue') }}: {{ props.overdueCount }}
      </UiBadge>
    </div>

    <div v-if="props.principalAmount > 0" class="grid gap-1.5" data-loan-progress>
      <div class="flex flex-wrap items-baseline gap-x-1.5">
        <UiText variant="caption">
          {{ t('loans.repaid') }}
        </UiText>
        <Amount
          :amount="repaid"
          :currencyCode="props.currencyCode"
          align="left"
          variant="secondary"
        />
        <UiText variant="caption">
          {{ t('loans.of') }}
        </UiText>
        <Amount
          :amount="props.principalAmount"
          :currencyCode="props.currencyCode"
          align="left"
          variant="secondary"
        />
      </div>

      <div
        class="h-1.5 overflow-hidden rounded-full bg-elevated/60"
        role="progressbar"
        :aria-valuenow="Math.round(repaidShare * 100)"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div class="h-full rounded-full bg-primary" :style="{ width: `${repaidShare * 100}%` }" />
      </div>

      <UiText v-if="!props.isClosed && props.monthsLeft > 0" variant="meta">
        {{ t('loans.monthsLeft', props.monthsLeft) }}<template v-if="props.plannedEndDate">
          · {{ t('loans.by') }} {{ props.plannedEndDate }}
        </template>
      </UiText>
    </div>

    <div
      v-if="props.nextPayment"
      class="flex items-center gap-3 rounded-sm bg-elevated/30 px-3 py-2"
      data-loan-next-payment
    >
      <div class="grid gap-0.5">
        <UiText variant="caption">
          {{ t('loans.nextPayment') }} · {{ props.nextPayment.date }}
        </UiText>
        <Amount
          :amount="props.nextPayment.amount"
          :currencyCode="props.currencyCode"
          align="left"
          variant="summary"
        />
      </div>
      <UButton
        class="ml-auto"
        color="primary"
        size="sm"
        data-loan-pay-next
        @click="emit('pay')"
      >
        {{ t('loans.pay') }}
      </UButton>
    </div>

    <LoansNotice
      v-if="props.debitShortfall !== null"
      :amount="props.debitShortfall"
      :currencyCode="props.currencyCode"
      :title="t('loans.notEnoughOnDebit')"
      data-loan-warning="shortfall"
      tone="error"
    />

    <LoansNotice
      v-if="props.unrecognized !== 0"
      :amount="props.unrecognized"
      :currencyCode="props.currencyCode"
      :hint="t('loans.unrecognizedHint')"
      :title="t('loans.unrecognized')"
      data-loan-warning="unrecognized"
      tone="warning"
    />

    <LoansNotice
      v-if="props.interestMissing > 0"
      :hint="t('loans.interestMissing.hint')"
      :title="t('loans.interestMissing.summary', props.interestMissing)"
      data-loan-warning="interestMissing"
      tone="warning"
    />

    <LoansNotice
      v-if="props.principalFreeMonths > 0"
      :amount="props.principalFreeInterest"
      :currencyCode="props.currencyCode"
      :title="t('loans.principalFree.summary', props.principalFreeMonths)"
      data-loan-warning="principalFree"
      tone="warning"
    />

    <div class="grid grid-cols-2 gap-2">
      <LoansStatCell
        :amount="props.paidTotal"
        :currencyCode="props.currencyCode"
        :title="t('loans.paidTotal')"
      />

      <LoansStatCell
        :amount="props.overpaid"
        :currencyCode="props.currencyCode"
        :title="`${t('loans.overpaid')} · ${t('loans.ofPrincipal', { share: percent })}`"
      />
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
        <Amount
          :amount="props.plannedInterest"
          :currencyCode="props.currencyCode"
          align="left"
          variant="secondary"
        />
      </div>

      <div
        v-if="props.bankDebt"
        data-loan-bank-debt
        class="flex items-baseline justify-between gap-2"
        :class="{ 'opacity-60': props.bankDebt.isStale }"
      >
        <UiText variant="caption" :class="props.bankDebt.diff !== 0 && 'text-warning'">
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
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  /**
   * The wallet against the debt the bank reports: `diff` is ours minus the bank's, 0 when they
   * match. Stale when a payment fell due after the bank figure. null until bank sync pushed one.
   */
  bankDebt: { date: string, diff: number, isStale: boolean } | null
  /** Preformatted civil day of the last payment; null while the loan is open. */
  closedDate: string | null
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
  /** Preformatted civil day the loan was issued. */
  openedDate: string
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
  edit: []
  pay: []
  prepay: []
}>()

const { t } = useI18n()

const percent = computed(() => `${Math.round(props.overpaidShare * 100)}%`)
const repaid = computed(() => Math.max(0, Math.min(props.principalAmount, props.principalAmount - props.remaining)))
const repaidShare = computed(() => props.principalAmount > 0 ? repaid.value / props.principalAmount : 0)

type Notice = { amount?: number, hint?: string, key: string, title: string, tone: 'error' | 'warning' }

const notices = computed(() => {
  const items: Notice[] = []
  if (props.debitShortfall !== null)
    items.push({ amount: props.debitShortfall, key: 'shortfall', title: t('loans.notEnoughOnDebit'), tone: 'error' })
  if (props.unrecognized !== 0)
    items.push({ amount: props.unrecognized, hint: t('loans.unrecognizedHint'), key: 'unrecognized', title: t('loans.unrecognized'), tone: 'warning' })
  if (props.interestMissing > 0)
    items.push({ hint: t('loans.interestMissing.hint'), key: 'interestMissing', title: t('loans.interestMissing.summary', props.interestMissing), tone: 'warning' })
  if (props.principalFreeMonths > 0)
    items.push({ amount: props.principalFreeInterest, key: 'principalFree', title: t('loans.principalFree.summary', props.principalFreeMonths), tone: 'warning' })
  return items
})
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-center gap-2">
      <UiTitleSection>
        {{ t('loans.title') }}
      </UiTitleSection>

      <UButton
        :aria-label="t('loans.edit')"
        color="neutral"
        icon="i-lucide-pencil"
        size="xs"
        variant="ghost"
        data-loan-edit
        @click="emit('edit')"
      />

      <UiBadge v-if="props.isClosed" tone="muted">
        {{ t('loans.closed') }}
      </UiBadge>

      <UiBadge v-if="props.overdueCount > 0" tone="error">
        {{ t('loans.overdue') }}: {{ props.overdueCount }}
      </UiBadge>

      <UiText variant="meta" class="ml-auto" data-loan-opened>
        {{ t('loans.opened') }} {{ props.openedDate }}
      </UiText>
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

      <UProgress :modelValue="Math.round(repaidShare * 100)" size="xs" />

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
      <div class="ml-auto flex flex-wrap justify-end gap-2">
        <UButton
          color="neutral"
          size="sm"
          variant="soft"
          data-loan-prepay
          @click="emit('prepay')"
        >
          {{ t('loans.prepay') }}
        </UButton>
        <UButton
          color="primary"
          size="sm"
          data-loan-pay-next
          @click="emit('pay')"
        >
          {{ t('loans.pay') }}
        </UButton>
      </div>
    </div>

    <UAlert
      v-for="notice in notices"
      :key="notice.key"
      :color="notice.tone"
      :data-loan-warning="notice.key"
      :title="notice.title"
      variant="soft"
    >
      <template v-if="notice.amount !== undefined || notice.hint" #description>
        <Amount
          v-if="notice.amount !== undefined"
          :amount="notice.amount"
          :currencyCode="props.currencyCode"
          align="left"
          variant="secondary"
        />
        <span v-if="notice.hint">{{ notice.hint }}</span>
      </template>
    </UAlert>

    <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
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

      <LoansStatCell
        v-if="!props.isClosed"
        :amount="props.plannedInterest"
        :currencyCode="props.currencyCode"
        :title="t('loans.plannedOverpayment')"
      />
    </div>

    <div class="grid">
      <UiElement
        v-if="props.contractRate !== null || props.effectiveRate !== null"
        class="group"
        insideClasses="justify-between"
        :lineWidth="5"
      >
        <UiText variant="caption">
          {{ t('loans.contractRate') }}
        </UiText>
        <div class="grid justify-items-end">
          <UiText v-if="props.contractRate !== null" variant="navigation">
            {{ props.contractRate }}%
          </UiText>
          <UiText v-if="props.effectiveRate !== null" variant="meta" data-loan-rate="effective">
            {{ t('loans.effectiveRateHint', { rate: props.effectiveRate }) }}
          </UiText>
        </div>
      </UiElement>

      <UiElement
        v-if="props.bankDebt"
        data-loan-bank-debt
        class="group"
        :class="{ 'opacity-60': props.bankDebt.isStale }"
        insideClasses="justify-between"
        :lineWidth="5"
      >
        <UiText variant="caption" :class="props.bankDebt.diff !== 0 && 'text-warning!'">
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
      </UiElement>

      <UiElement
        v-if="props.closedDate"
        data-loan-closed-date
        class="group"
        insideClasses="justify-between"
        :lineWidth="5"
      >
        <UiText variant="caption">
          {{ t('loans.closed') }}
        </UiText>
        <UiText variant="meta">
          {{ props.closedDate }}
        </UiText>
      </UiElement>
    </div>
  </div>
</template>

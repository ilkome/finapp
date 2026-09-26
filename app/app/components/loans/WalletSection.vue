<script setup lang="ts">
import { formatByLocale } from '~~/utils/date/civil'

import type { OverpaymentMode } from '~/components/loans/engine/types'
import type { LoanScheduleRowDraft } from '~/components/loans/ScheduleRowForm.vue'
import type { LoanScheduleViewRow } from '~/components/loans/ScheduleView.vue'
import type { LoanScheduleRowItem } from '~/components/loans/types'
import type { WalletId } from '~/components/wallets/types'

import { toCostProps, toScheduleViewRows, toSummaryProps } from '~/components/loans/presenters'
import { loanScheduleRowIdFor } from '~/components/loans/types'
import { useLoansStore } from '~/components/loans/useLoansStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  walletId: WalletId
}>()

const dateLocale = useDateLocale()
const today = useCivilToday()
const loansStore = useLoansStore()
const walletsStore = useWalletsStore()
const trnsFormStore = useTrnsFormStore()

// A new formatter per locale: the presenter memoizes formatted dates per formatter.
const day = computed(() => {
  const locale = dateLocale.value
  return (ms: number) => formatByLocale(ms, 'dd.MM.yyyy', locale)
})
const month = (ms: number) => formatByLocale(ms, 'MM.yyyy', dateLocale.value)

const currencyCode = computed(() => walletsStore.items?.[props.walletId]?.currency ?? 'USD')
const entry = computed(() => loansStore.byWalletId.get(props.walletId))
const loanId = computed(() => loansStore.loanIdByWalletId.get(props.walletId))
const cost = computed(() => loansStore.costByWalletId.get(props.walletId))

const summaryProps = computed(() => {
  const found = entry.value
  if (!found)
    return null
  const { loan, summary } = found
  const debitBalance = loan.debitWalletId ? walletsStore.itemsComputed[loan.debitWalletId]?.amount ?? 0 : null
  return toSummaryProps({ currencyCode: currencyCode.value, day: day.value, debitBalance, loan, summary, today: today.value })
})

/** Stored overrides of this loan, keyed by payment number - the only rows that can be reset. */
const overrideIdByNumber = computed(() => new Map(
  Object.entries(loansStore.scheduleRows)
    .filter(([, row]) => row.loanId === loanId.value)
    .map(([id, row]) => [row.paymentNumber, id]),
))

const scheduleRows = computed<LoanScheduleViewRow[]>(() =>
  toScheduleViewRows(entry.value?.summary.rows ?? [], new Set(overrideIdByNumber.value.keys()), day.value),
)

const firstUnpaidIndex = computed(() =>
  (entry.value?.summary.rows ?? []).findIndex(row => row.status !== 'paid' && row.status !== 'late'),
)

const costProps = computed(() => toCostProps(cost.value, currencyCode.value, month))

const extra = ref(0)
const whatIfMode = ref<OverpaymentMode>('reducePayment')
const whatIf = computed(() => loansStore.getWhatIf(props.walletId, extra.value, whatIfMode.value))

const editing = ref<LoanScheduleRowDraft | null>(null)

function onEdit(row: LoanScheduleViewRow) {
  const source = entry.value?.summary.rows.find(item => item.paymentNumber === row.paymentNumber)
  if (!source)
    return
  editing.value = {
    date: source.date,
    fine: 0,
    interestPart: source.interestPart,
    paymentNumber: source.paymentNumber,
    principalPart: source.principalPart,
  }
}

function onSaveEdit() {
  const draft = editing.value
  if (!draft || !loanId.value)
    return

  const values: LoanScheduleRowItem = {
    date: draft.date,
    interestPart: draft.interestPart,
    loanId: loanId.value,
    paymentNumber: draft.paymentNumber,
    principalPart: draft.principalPart,
    source: 'manual',
    totalAmount: draft.principalPart + draft.interestPart + draft.fine,
    updatedAt: Date.now(),
  }
  // Imported rows may still carry random ids: reuse them so the edit never creates a duplicate.
  loansStore.saveScheduleRow(overrideIdByNumber.value.get(draft.paymentNumber) ?? loanScheduleRowIdFor(loanId.value, draft.paymentNumber), values)
  editing.value = null
}

function onResetRow(paymentNumber: number) {
  const id = overrideIdByNumber.value.get(paymentNumber)
  if (id)
    loansStore.deleteScheduleRow(id)
}

function onPay(row: LoanScheduleViewRow) {
  const source = entry.value?.summary.rows.find(item => item.paymentNumber === row.paymentNumber)
  if (!source)
    return
  trnsFormStore.openFormForLoanPayment({
    date: source.date,
    debitWalletId: entry.value?.loan.debitWalletId,
    interest: Math.max(0, source.interestPart - source.paidInterest),
    principal: Math.max(0, source.principalPart - source.paidPrincipal),
    walletId: props.walletId,
  })
}
</script>

<template>
  <div class="grid gap-4">
    <LoansSummaryView v-if="summaryProps" v-bind="summaryProps" />

    <LoansScheduleView
      v-if="entry"
      :currencyCode
      :firstUnpaidIndex
      :rows="scheduleRows"
      @edit="onEdit"
      @pay="onPay"
      @resetRow="onResetRow"
    />

    <LoansScheduleRowForm
      v-if="entry && editing"
      :modelValue="editing"
      @cancel="editing = null"
      @save="onSaveEdit"
      @update:modelValue="(value) => editing = value"
    />

    <LoansCostView v-bind="costProps" />

    <LoansWhatIfView
      v-if="entry && !entry.summary.isClosed && Math.abs(entry.summary.unrecognized) < 0.01 && whatIf"
      :currencyCode
      :extra
      :interestSaved="whatIf.interestSaved"
      :mode="whatIfMode"
      :newEndDate="whatIf.newEndDate === null ? null : day(whatIf.newEndDate)"
      @update:extra="(value: number) => extra = value"
      @update:mode="(value: OverpaymentMode) => whatIfMode = value"
    />
  </div>
</template>

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

const { t } = useI18n()
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
const month = (ms: number) => formatByLocale(ms, 'LLL yyyy', dateLocale.value)

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
const isShowLoanForm = ref(false)

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

const resetting = ref<LoanScheduleViewRow | null>(null)

function onResetRow() {
  const id = resetting.value && overrideIdByNumber.value.get(resetting.value.paymentNumber)
  if (id)
    loansStore.deleteScheduleRow(id)
}

function onPay(paymentNumber: number) {
  const source = entry.value?.summary.rows.find(item => item.paymentNumber === paymentNumber)
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

function onPayNext() {
  const row = entry.value?.summary.rows[firstUnpaidIndex.value]
  if (row)
    onPay(row.paymentNumber)
}
</script>

<template>
  <div class="grid gap-4">
    <LoansSummaryView
      v-if="summaryProps"
      v-bind="summaryProps"
      @pay="onPayNext"
    />

    <div v-else class="flex flex-wrap items-center gap-2 rounded-sm bg-elevated/30 px-3 py-2" data-loan-empty>
      <UiText variant="meta" class="grow">
        {{ t('loans.emptyHint') }}
      </UiText>
      <UButton
        color="neutral"
        icon="i-lucide-landmark"
        size="sm"
        variant="soft"
        @click="isShowLoanForm = true"
      >
        {{ t('loans.add') }}
      </UButton>
    </div>

    <UModal
      v-model:open="isShowLoanForm"
      :title="t('loans.add')"
      :ui="{ content: 'max-w-lg' }"
    >
      <template #body>
        <LoansForm :walletId @afterSave="isShowLoanForm = false" />
      </template>
    </UModal>

    <LoansScheduleView
      v-if="entry"
      :currencyCode
      :firstUnpaidIndex
      :rows="scheduleRows"
      @edit="onEdit"
      @pay="(row: LoanScheduleViewRow) => onPay(row.paymentNumber)"
      @resetRow="(row: LoanScheduleViewRow) => resetting = row"
    />

    <LayoutConfirmModal
      v-if="resetting"
      :confirmLabel="resetting.isBank ? t('loans.resetBankRow') : t('loans.resetRow')"
      :description="resetting.isBank ? t('loans.resetBankRowConfirm') : undefined"
      :title="t('loans.resetRowConfirm')"
      @closed="resetting = null"
      @confirm="onResetRow"
    />

    <UModal
      :open="!!editing"
      :title="t('loans.editRow')"
      :ui="{ content: 'max-w-md' }"
      @update:open="(isOpen: boolean) => { if (!isOpen) editing = null }"
    >
      <template #body>
        <LoansScheduleRowForm
          v-if="editing"
          :modelValue="editing"
          @cancel="editing = null"
          @save="onSaveEdit"
          @update:modelValue="(value) => editing = value"
        />
      </template>
    </UModal>

    <LoansCostView v-if="costProps.byMonth.length" v-bind="costProps" :isHideTotals="!!entry" />

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

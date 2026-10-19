<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import { formatByLocale } from '~~/utils/date/civil'

import type { LoanAmortizationRow } from '~/components/loans/AmortizationView.vue'
import type { OverpaymentMode } from '~/components/loans/engine/types'
import type { LoanScheduleRowDraft } from '~/components/loans/ScheduleRowForm.vue'
import type { LoanScheduleViewRow } from '~/components/loans/ScheduleView.vue'
import type { WalletId } from '~/components/wallets/types'

import { currencyMinorUnit } from '~/components/currencies/currencies'
import { toCostProps, toScheduleViewRows, toSummaryProps } from '~/components/loans/presenters'
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

const currencyCode = computed(() => walletsStore.currencyOf(props.walletId))
const entry = computed(() => loansStore.byWalletId.get(props.walletId))
const loanId = computed(() => loansStore.loanIdByWalletId.get(props.walletId))
const cost = computed(() => loansStore.costByWalletId.get(props.walletId))
// Only a loan wallet takes loan terms; a credit card has a minimum payment instead.
const isLoanWallet = computed(() => walletsStore.items?.[props.walletId]?.type === 'loan')

const minPayment = computed(() => loansStore.minPaymentByWalletId.get(props.walletId) ?? null)

const grace = computed(() => {
  const found = loansStore.graceByWalletId.get(props.walletId)
  return found && {
    amount: found.amount,
    date: found.date === null ? null : day.value(found.date),
    statementDate: found.statementDate === null ? null : day.value(found.statementDate),
    status: found.status,
  }
})

function onPayMin() {
  const found = minPayment.value
  if (found)
    trnsFormStore.openFormForLoanPayment({ date: today.value, interest: 0, principal: found.amount, walletId: props.walletId })
}

const summaryProps = computed(() => {
  const found = entry.value
  if (!found)
    return null
  const { loan, summary } = found
  // A deleted debit wallet means no balance to compare, not an empty one.
  const debitBalance = loan.debitWalletId ? walletsStore.itemsComputed[loan.debitWalletId]?.amount ?? null : null
  return toSummaryProps({ currencyCode: currencyCode.value, day: day.value, debitBalance, loan, summary, today: today.value })
})

const NO_IDS = new Map<number, string>()
/** Stored overrides of this loan, keyed by payment number - the only rows that can be reset. */
const overrideIdByNumber = computed(() => (loanId.value && loansStore.scheduleRowIdsByLoanId.get(loanId.value)) || NO_IDS)

const scheduleRows = computed<LoanScheduleViewRow[]>(() =>
  toScheduleViewRows(entry.value?.summary.rows ?? [], new Set(overrideIdByNumber.value.keys()), day.value, currencyMinorUnit(currencyCode.value)),
)

const amortizationRows = computed<LoanAmortizationRow[]>(() => (entry.value?.summary.rows ?? []).map(row => ({
  interest: row.interestPart,
  isPaid: row.status === 'paid' || row.status === 'late',
  label: formatByLocale(row.date, 'MM.yy', dateLocale.value),
  principal: row.principalPart,
})))

const firstUnpaidIndex = computed(() => entry.value?.summary.firstUnpaidIndex ?? -1)

const costProps = computed(() => toCostProps(cost.value, currencyCode.value, month))

const extra = ref(0)
const whatIfMode = ref<OverpaymentMode>('reducePayment')
// Two tail re-solves per run: wait for the user to stop typing.
const extraDebounced = refDebounced(extra, 250)
const whatIf = computed(() => loansStore.getWhatIf(props.walletId, extraDebounced.value, whatIfMode.value))

const editing = ref<LoanScheduleRowDraft | null>(null)
const isShowLoanForm = ref(false)
// vueuse types a binding as a prop option, so a function type must stay `any`.
const [DefineBody, ReuseBody] = createReusableTemplate<{ close: any }>()
const isLaptop = useIsLaptop()

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

const confirm = useConfirm()

async function onResetRow(row: LoanScheduleViewRow) {
  const confirmed = await confirm.ask({
    confirmLabel: row.isBank ? t('loans.resetBankRow') : t('loans.resetRow'),
    description: row.isBank ? t('loans.resetBankRowConfirm') : undefined,
    title: t('loans.resetRowConfirm'),
  })
  const id = confirmed && overrideIdByNumber.value.get(row.paymentNumber)
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

// The amount is left empty: the reconcile rebuilds the schedule tail by `overpaymentMode` after save.
function onPrepay() {
  trnsFormStore.openFormForLoanPayment({ date: today.value, debitWalletId: entry.value?.loan.debitWalletId, interest: 0, principal: 0, walletId: props.walletId })
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
      @edit="isShowLoanForm = true"
      @pay="onPayNext"
      @prepay="onPrepay"
    />

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

    <div v-else-if="isLoanWallet" class="flex flex-wrap items-center gap-2 rounded-sm bg-elevated/30 px-3 py-2" data-loan-empty>
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

    <div v-else-if="minPayment || grace" class="flex flex-wrap items-center gap-2 rounded-sm bg-elevated/30 px-3 py-2" data-loan-card-pay>
      <LoansCardLineView
        class="grow"
        :currencyCode
        :grace
        :loan="null"
        :minPayment="minPayment && { ...minPayment, date: day(minPayment.date) }"
      />
      <UButton
        v-if="minPayment && minPayment.status !== 'paid'"
        color="neutral"
        icon="i-lucide-banknote"
        size="sm"
        variant="soft"
        @click="onPayMin"
      >
        {{ t('loans.pay') }}
      </UButton>
    </div>

    <DefineBody v-slot="{ close }">
      <LoansForm :loanId :walletId @afterSave="close" />
    </DefineBody>

    <template v-if="isShowLoanForm">
      <UiModalWrap
        v-if="isLaptop"
        defaultOpen
        :title="entry ? t('loans.edit') : t('loans.add')"
        @after:leave="isShowLoanForm = false"
      >
        <template #default="{ close }">
          <ReuseBody :close />
        </template>
      </UiModalWrap>

      <Drawer
        v-else
        :title="entry ? t('loans.edit') : t('loans.add')"
        contentClass="min-h-[50dvh]"
        @closed="isShowLoanForm = false"
      >
        <template #default="{ close }">
          <div class="drawer-body">
            <ReuseBody :close />
          </div>
        </template>
      </Drawer>
    </template>

    <LoansAmortizationView v-if="entry" :currencyCode :rows="amortizationRows" />

    <LoansScheduleView
      v-if="entry"
      :currencyCode
      :firstUnpaidIndex
      :rows="scheduleRows"
      @edit="onEdit"
      @pay="(row: LoanScheduleViewRow) => onPay(row.paymentNumber)"
      @resetRow="onResetRow"
    />

    <LoansScheduleRowEditor
      v-if="editing && loanId"
      :initial="editing"
      :loanId
      :overrideId="overrideIdByNumber.get(editing.paymentNumber)"
      @closed="editing = null"
    />

    <LoansCostView v-if="costProps.byMonth.length" v-bind="costProps" :isHideTotals="!!entry" />
  </div>
</template>

<script setup lang="ts">
import { formatAmount } from '~/components/amount/utils'

export type LoanScheduleViewRow = {
  /** Fact when the row was paid, plan otherwise. */
  amount: number
  /** Only rows stored as an override can be reset back to the generator. */
  canReset: boolean
  /** Preformatted civil day. */
  date: string
  /** Fact minus plan; 0 while nothing landed. */
  delta: number
  fine: number
  interest: number
  /** Imported from the bank: resetting it drops the bank's figures, not a manual edit. */
  isBank: boolean
  isPayable: boolean
  paymentNumber: number
  principal: number
  /** The month of this row leaves the debt where it was. */
  principalFree: 'holiday' | 'interestOnly' | null
  status: 'late' | 'overdue' | 'paid' | 'partial' | 'scheduled'
}

const props = defineProps<{
  currencyCode: string
  /** Index in `rows` the collapsed window centres on. */
  firstUnpaidIndex: number
  rows: LoanScheduleViewRow[]
}>()

const emit = defineEmits<{
  edit: [row: LoanScheduleViewRow]
  pay: [row: LoanScheduleViewRow]
  resetRow: [row: LoanScheduleViewRow]
}>()

const { t } = useI18n()

// Collapsed: the last two payments for context, the current one and the next three.
const BEFORE = 2
const AFTER = 3
const isShowAll = ref(false)
const expanded = ref<number | null>(null)

const currentNumber = computed(() => props.rows[props.firstUnpaidIndex]?.paymentNumber ?? null)

const visibleRows = computed(() => {
  if (isShowAll.value || props.rows.length <= BEFORE + AFTER + 1)
    return props.rows
  const center = props.firstUnpaidIndex < 0 ? props.rows.length - 1 : props.firstUnpaidIndex
  return props.rows.slice(Math.max(0, center - BEFORE), center + AFTER + 1)
})

// A second payment on the same day is a prepayment on top of the regular one.
const earlyNumbers = computed(() => new Set(props.rows.filter((row, index) => index > 0 && props.rows[index - 1]!.date === row.date).map(row => row.paymentNumber)))

const statusClass: Record<LoanScheduleViewRow['status'], string> = {
  late: 'bg-warning',
  overdue: 'bg-error',
  paid: 'bg-success',
  partial: 'bg-warning',
  scheduled: 'bg-muted',
}
</script>

<template>
  <div class="grid gap-2">
    <UiTitleSection>
      {{ t('loans.schedule') }}
    </UiTitleSection>

    <div class="grid">
      <div
        v-for="row in visibleRows"
        :key="row.paymentNumber"
        class="grid gap-1 border-b border-default py-2 last:border-0"
      >
        <button
          type="button"
          class="-mx-2 flex w-[calc(100%+1rem)] items-center gap-2 rounded-sm px-2 py-0.5 text-left"
          :class="row.paymentNumber === currentNumber && 'bg-elevated/40'"
          :aria-expanded="expanded === row.paymentNumber"
          :data-loan-current="row.paymentNumber === currentNumber || undefined"
          :data-loan-row="row.paymentNumber"
          @click="expanded = expanded === row.paymentNumber ? null : row.paymentNumber"
        >
          <span
            class="size-2 shrink-0 rounded-full"
            :class="statusClass[row.status]"
            :data-loan-status="row.status"
          />

          <div class="grid min-w-16">
            <UiText variant="navigation">
              {{ row.date }}
            </UiText>
            <UiText variant="meta" data-loan-row-split>
              {{ t('loans.principal') }} {{ formatAmount(row.principal, props.currencyCode) }} · {{ t('loans.interest') }} {{ formatAmount(row.interest, props.currencyCode) }}
            </UiText>
          </div>

          <UiBadge v-if="earlyNumbers.has(row.paymentNumber)" tone="muted" data-loan-early>
            {{ t('loans.early') }}
          </UiBadge>

          <UiBadge
            v-if="row.principalFree"
            tone="warning"
            :data-loan-principal-free="row.principalFree"
          >
            {{ t(`loans.principalFree.${row.principalFree}`) }}
          </UiBadge>

          <div class="ml-auto">
            <Amount
              :amount="row.amount"
              :currencyCode="props.currencyCode"
              variant="row"
            />
          </div>
        </button>

        <div v-if="expanded === row.paymentNumber" class="grid gap-2 pl-4">
          <UiText variant="meta" data-loan-status-label>
            {{ t(`loans.status.${row.status}`) }}
          </UiText>

          <div v-if="row.fine" class="flex items-baseline gap-1.5">
            <UiText variant="meta">
              {{ t('loans.fine') }}
            </UiText>
            <Amount
              :amount="row.fine"
              :currencyCode="props.currencyCode"
              align="left"
              variant="secondary"
            />
          </div>

          <div v-if="row.delta" class="flex items-baseline gap-1.5" data-loan-delta>
            <UiText variant="meta">
              {{ t('loans.deltaVsPlan') }}
            </UiText>
            <Amount
              :amount="row.delta"
              :currencyCode="props.currencyCode"
              align="left"
              variant="secondary"
            />
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton
              v-if="row.isPayable"
              color="neutral"
              size="xs"
              variant="soft"
              @click="emit('pay', row)"
            >
              {{ t('loans.pay') }}
            </UButton>
            <UButton
              color="neutral"
              size="xs"
              variant="soft"
              @click="emit('edit', row)"
            >
              {{ t('base.edit') }}
            </UButton>
            <UButton
              v-if="row.canReset"
              :color="row.isBank ? 'error' : 'neutral'"
              size="xs"
              variant="soft"
              @click="emit('resetRow', row)"
            >
              {{ row.isBank ? t('loans.resetBankRow') : t('loans.resetRow') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <UButton
      v-if="props.rows.length > visibleRows.length || isShowAll"
      class="justify-self-start"
      color="neutral"
      size="xs"
      variant="link"
      @click="isShowAll = !isShowAll"
    >
      {{ isShowAll ? t('loans.showLess') : t('loans.showAll') }}
    </UButton>
  </div>
</template>

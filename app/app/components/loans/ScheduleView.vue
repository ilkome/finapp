<script setup lang="ts">
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
  resetRow: [paymentNumber: number]
}>()

const { t } = useI18n()

const WINDOW = 5
const isShowAll = ref(false)
const expanded = ref<number | null>(null)

const visibleRows = computed(() => {
  if (isShowAll.value || props.rows.length <= WINDOW * 2 + 1)
    return props.rows
  const center = props.firstUnpaidIndex < 0 ? props.rows.length - 1 : props.firstUnpaidIndex
  return props.rows.slice(Math.max(0, center - WINDOW), center + WINDOW + 1)
})

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
    <UiText variant="section">
      {{ t('loans.schedule') }}
    </UiText>

    <div class="grid">
      <div
        v-for="row in visibleRows"
        :key="row.paymentNumber"
        class="border-elevated/40 grid gap-1 border-b py-2 last:border-0"
      >
        <button
          type="button"
          class="flex w-full items-center gap-2 text-left"
          :data-loan-row="row.paymentNumber"
          @click="expanded = expanded === row.paymentNumber ? null : row.paymentNumber"
        >
          <span
            class="size-2 shrink-0 rounded-full"
            :class="statusClass[row.status]"
            :data-loan-status="row.status"
          />

          <UiText variant="navigation" class="min-w-16">
            {{ row.date }}
          </UiText>

          <span
            v-if="row.principalFree"
            class="rounded-sm bg-warning/15 px-2 py-0.5 text-2xs leading-4 text-warning"
            :data-loan-principal-free="row.principalFree"
          >
            {{ t(`loans.principalFree.${row.principalFree}`) }}
          </span>

          <div class="ml-auto">
            <Amount
              :amount="row.amount"
              :currencyCode="props.currencyCode"
              variant="row"
            />
          </div>
        </button>

        <div v-if="expanded === row.paymentNumber" class="grid gap-2 pl-4">
          <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <UiText variant="meta">
              {{ t('loans.principal') }}
            </UiText>
            <Amount
              :amount="row.principal"
              :currencyCode="props.currencyCode"
              align="left"
              variant="secondary"
            />

            <UiText variant="meta">
              {{ t('loans.interest') }}
            </UiText>
            <Amount
              :amount="row.interest"
              :currencyCode="props.currencyCode"
              align="left"
              variant="secondary"
            />

            <template v-if="row.fine">
              <UiText variant="meta">
                {{ t('loans.fine') }}
              </UiText>
              <Amount
                :amount="row.fine"
                :currencyCode="props.currencyCode"
                align="left"
                variant="secondary"
              />
            </template>
          </div>

          <UiText v-if="row.delta" variant="meta" data-loan-delta>
            {{ t('loans.deltaVsPlan') }}: {{ row.delta }}
          </UiText>

          <div class="flex flex-wrap gap-2">
            <button
              v-if="row.isPayable"
              type="button"
              class="rounded-sm bg-elevated/60 px-2 py-1 text-xs"
              @click="emit('pay', row)"
            >
              {{ t('loans.pay') }}
            </button>
            <button
              type="button"
              class="rounded-sm bg-elevated/60 px-2 py-1 text-xs"
              @click="emit('edit', row)"
            >
              {{ t('base.edit') }}
            </button>
            <button
              v-if="row.canReset"
              type="button"
              class="rounded-sm bg-elevated/60 px-2 py-1 text-xs"
              @click="emit('resetRow', row.paymentNumber)"
            >
              {{ t('loans.resetRow') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <button
      v-if="props.rows.length > visibleRows.length || isShowAll"
      type="button"
      class="justify-self-start text-xs text-muted"
      @click="isShowAll = !isShowAll"
    >
      {{ isShowAll ? t('loans.showLess') : t('loans.showAll') }}
    </button>
  </div>
</template>

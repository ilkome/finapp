<script setup lang="ts">
import type { LoanScheduleRowDraft } from '~/components/loans/ScheduleRowForm.vue'
import type { LoanId, LoanScheduleOverrideId } from '~/components/loans/types'

import { amountToMinor } from '~/components/amount/utils'
import { loanScheduleOverrideIdFor } from '~/components/loans/types'
import { useLoansStore } from '~/components/loans/useLoansStore'

const props = defineProps<{
  currencyCode: string
  /** Amounts as typed: decimals of `currencyCode`. */
  initial: LoanScheduleRowDraft
  loanId: LoanId
  /** The stored row this payment number already has. */
  overrideId?: LoanScheduleOverrideId
}>()

const emit = defineEmits<{
  closed: []
}>()

const { t } = useI18n()
const loansStore = useLoansStore()

const draft = ref<LoanScheduleRowDraft>({ ...props.initial })

function save(close: () => void) {
  const { date, paymentNumber } = draft.value
  const fine = amountToMinor(draft.value.fine, props.currencyCode)
  const interestAmount = amountToMinor(draft.value.interestPart, props.currencyCode)
  const principalAmount = amountToMinor(draft.value.principalPart, props.currencyCode)
  loansStore.saveScheduleOverride(props.overrideId ?? loanScheduleOverrideIdFor(props.loanId, paymentNumber), {
    createdAt: Date.now(),
    dueDate: date,
    interestAmount,
    loanId: props.loanId,
    paymentNumber,
    principalAmount,
    source: 'manual',
    totalAmount: principalAmount + interestAmount + fine,
    updatedAt: Date.now(),
  })
  close()
}
</script>

<template>
  <UiSheet
    modalClass="max-w-md"
    :title="t('loans.editRow')"
    @closed="emit('closed')"
  >
    <template #default="{ close }">
      <LoansScheduleRowForm
        v-model="draft"
        @cancel="close"
        @save="save(close)"
      />
    </template>
  </UiSheet>
</template>

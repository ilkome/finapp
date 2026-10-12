<script setup lang="ts">
import type { LoanScheduleRowDraft } from '~/components/loans/ScheduleRowForm.vue'
import type { LoanId, LoanScheduleRowId } from '~/components/loans/types'

import { loanScheduleRowIdFor } from '~/components/loans/types'
import { useLoansStore } from '~/components/loans/useLoansStore'

const props = defineProps<{
  initial: LoanScheduleRowDraft
  loanId: LoanId
  /** The stored row this payment number already has. */
  overrideId?: LoanScheduleRowId
}>()

const emit = defineEmits<{
  closed: []
}>()

const { t } = useI18n()
const loansStore = useLoansStore()

const draft = ref<LoanScheduleRowDraft>({ ...props.initial })

function save(close: () => void) {
  const { date, fine, interestPart, paymentNumber, principalPart } = draft.value
  // Rows written before the deterministic id scheme keep their random ids: reuse them so the edit
  // never creates a duplicate.
  loansStore.saveScheduleRow(props.overrideId ?? loanScheduleRowIdFor(props.loanId, paymentNumber), {
    date,
    interestPart,
    loanId: props.loanId,
    paymentNumber,
    principalPart,
    source: 'manual',
    totalAmount: principalPart + interestPart + fine,
    updatedAt: Date.now(),
  })
  close()
}
</script>

<template>
  <BottomSheetOrModal :title="t('loans.editRow')" width="max-w-md" @closed="emit('closed')">
    <template #default="{ close }">
      <LoansScheduleRowForm
        v-model="draft"
        @cancel="close"
        @save="save(close)"
      />
    </template>
  </BottomSheetOrModal>
</template>

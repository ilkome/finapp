<script setup lang="ts">
import type { LoanId, LoanItem } from '~/components/loans/types'
import type { WalletId } from '~/components/wallets/types'

import { getDefaultLoanItem, loanIdFor, loanInterestMethods, loanItemSchema, loanOverpaymentModes, loanScheduleTypes } from '~/components/loans/types'
import { useLoansStore } from '~/components/loans/useLoansStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { showErrorToast } from '~/composables/useStoreSync'

const props = defineProps<{
  loanId?: LoanId
  walletId: WalletId
}>()

const emit = defineEmits<{
  afterSave: []
}>()

const { t } = useI18n()
const loansStore = useLoansStore()
const walletsStore = useWalletsStore()

const editId = props.loanId ?? loanIdFor(props.walletId)
const form = ref<LoanItem>({
  ...getDefaultLoanItem(props.walletId),
  ...(props.loanId ? loansStore.items[props.loanId] : undefined),
})

const scheduleTypeOptions = loanScheduleTypes.map(value => ({ label: t(`loans.scheduleTypes.${value}`), value }))
const overpaymentModeOptions = loanOverpaymentModes.map(value => ({ label: t(`loans.modes.${value}`), value }))
const interestMethodOptions = loanInterestMethods.map(value => ({ label: t(`loans.interestMethods.${value}`), value }))
const days = (value: string) => Math.max(0, Math.round(Number(value) || 0))
const debitWalletOptions = computed(() => [
  { label: t('loans.noDebitWallet'), value: '' },
  ...walletsStore.sortedIds
    .filter(id => id !== props.walletId)
    .map(id => ({ label: walletsStore.items?.[id]?.name ?? id, value: id })),
])

function onSave() {
  const values = loanItemSchema.safeParse({ ...form.value, updatedAt: Date.now() })
  if (!values.success) {
    showErrorToast('loans.errors.saveFailed')
    return
  }
  loansStore.saveLoan(editId, values.data)
  emit('afterSave')
}
</script>

<template>
  <div class="grid max-w-lg gap-4 px-3 py-4 lg:px-4">
    <FormElement>
      <template #label>
        {{ t('loans.form.principalAmount') }}
      </template>
      <FormInput
        type="number"
        :modelValue="String(form.principalAmount)"
        @update:modelValue="(value: string) => form.principalAmount = Number(value) || 0"
      />
    </FormElement>

    <FormElement>
      <template #label>
        {{ t('loans.form.annualRate') }}
      </template>
      <FormInput
        type="number"
        :modelValue="form.annualRate === null ? '' : String(form.annualRate)"
        @update:modelValue="(value: string) => form.annualRate = value.trim() === '' ? null : Number(value) || 0"
      />
    </FormElement>

    <FormElement>
      <template #label>
        {{ t('loans.form.startDate') }}
      </template>
      <FormDate
        :modelValue="form.startDate"
        @update:modelValue="(value: number | null) => { if (value !== null) form.startDate = value }"
      />
    </FormElement>

    <FormElement>
      <template #label>
        {{ t('loans.form.firstPaymentDate') }}
      </template>
      <FormDate
        :modelValue="form.firstPaymentDate"
        @update:modelValue="(value: number | null) => { if (value !== null) form.firstPaymentDate = value }"
      />
    </FormElement>

    <FormElement>
      <template #label>
        {{ t('loans.form.termMonths') }}
      </template>
      <FormInput
        type="number"
        :modelValue="String(form.termMonths)"
        @update:modelValue="(value: string) => form.termMonths = Number(value) || 1"
      />
    </FormElement>

    <FormElement>
      <template #label>
        {{ t('loans.form.paymentDay') }}
      </template>
      <FormInput
        type="number"
        :modelValue="String(form.paymentDay)"
        @update:modelValue="(value: string) => form.paymentDay = Math.min(31, Math.max(1, Number(value) || 1))"
      />
    </FormElement>

    <FormElement>
      <template #label>
        {{ t('loans.form.scheduleType') }}
      </template>
      <FormSelect
        :options="scheduleTypeOptions"
        :value="form.scheduleType"
        @change="(value: string) => form.scheduleType = value as LoanItem['scheduleType']"
      />
    </FormElement>

    <FormElement>
      <template #label>
        {{ t('loans.form.overpaymentMode') }}
      </template>
      <FormSelect
        :options="overpaymentModeOptions"
        :value="form.overpaymentMode"
        @change="(value: string) => form.overpaymentMode = value as LoanItem['overpaymentMode']"
      />
    </FormElement>

    <FormElement>
      <template #label>
        {{ t('loans.form.interestMethod') }}
      </template>
      <FormSelect
        :options="interestMethodOptions"
        :value="form.interestMethod"
        @change="(value: string) => form.interestMethod = value as LoanItem['interestMethod']"
      />
    </FormElement>

    <FormElement>
      <template #label>
        {{ t('loans.form.lateAfterDays') }}
      </template>
      <FormInput
        type="number"
        :modelValue="String(form.lateAfterDays)"
        @update:modelValue="(value: string) => form.lateAfterDays = days(value)"
      />
    </FormElement>

    <FormElement>
      <template #label>
        {{ t('loans.form.prepayWindowDays') }}
      </template>
      <FormInput
        type="number"
        :modelValue="String(form.prepayWindowDays)"
        @update:modelValue="(value: string) => form.prepayWindowDays = days(value)"
      />
    </FormElement>

    <FormElement>
      <template #label>
        {{ t('loans.form.debitWalletId') }}
      </template>
      <FormSelect
        :options="debitWalletOptions"
        :value="form.debitWalletId ?? ''"
        @change="(value: string) => form.debitWalletId = value || undefined"
      />
    </FormElement>

    <FormElement>
      <template #label>
        {{ t('loans.form.contractNumber') }}
      </template>
      <FormInput
        :modelValue="form.contractNumber"
        @update:modelValue="(value: string) => form.contractNumber = value"
      />
    </FormElement>

    <FormElement>
      <template #label>
        {{ t('loans.form.desc') }}
      </template>
      <FormTextarea
        :placeholder="t('loans.form.desc')"
        :modelValue="form.desc"
        @update:modelValue="(value: string) => form.desc = value"
      />
    </FormElement>

    <div class="flex-center">
      <UiButtonAccent class="sm:max-w-xs" @click="onSave">
        {{ t('base.save') }}
      </UiButtonAccent>
    </div>
  </div>
</template>

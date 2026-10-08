<script setup lang="ts">
import { formatByLocale } from '~~/utils/date/civil'

import type { LoanId, LoanItem } from '~/components/loans/types'
import type { WalletId } from '~/components/wallets/types'

import { paramsOf } from '~/components/loans/engine/derive'
import { generateSchedule } from '~/components/loans/engine/schedule'
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
const dateLocale = useDateLocale()
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

// Required numbers the schema alone would accept as 0 and save as an empty loan.
const errors = ref<{ firstPaymentDate?: string, principalAmount?: string, termMonths?: string }>({})

/** What the bank quotes: the payment, the total interest and the last day, live while typing. */
const preview = computed(() => {
  if (form.value.principalAmount <= 0 || form.value.termMonths < 1 || form.value.termMonths > 600)
    return null
  const rows = generateSchedule(paramsOf(form.value))
  if (rows.length === 0)
    return null
  return {
    endDate: formatByLocale(rows.at(-1)!.date, 'dd.MM.yyyy', dateLocale.value),
    interest: rows.reduce((total, row) => total + row.interestPart, 0),
    payment: rows[0]!.totalAmount,
  }
})
const currencyCode = computed(() => walletsStore.items?.[props.walletId]?.currency ?? 'USD')
const isShowAdvanced = ref(false)

function onChangeFirstPaymentDate(value: number | null) {
  if (value === null)
    return
  form.value.firstPaymentDate = value
  // Civil days are UTC midnight, so the UTC day of month is the payment day.
  form.value.paymentDay = new Date(value).getUTCDate()
}

function onSave() {
  errors.value = {
    firstPaymentDate: form.value.firstPaymentDate >= form.value.startDate ? undefined : t('loans.form.errors.firstPaymentDate'),
    principalAmount: form.value.principalAmount > 0 ? undefined : t('loans.form.errors.principalAmount'),
    termMonths: form.value.termMonths >= 1 ? undefined : t('loans.form.errors.termMonths'),
  }
  if (errors.value.principalAmount || errors.value.termMonths || errors.value.firstPaymentDate)
    return

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
        inputmode="decimal"
        data-loan-form="principalAmount"
        :modelValue="form.principalAmount || ''"
        @update:modelValue="(value: string) => form.principalAmount = Number(value) || 0"
      />
      <UiText v-if="errors.principalAmount" variant="meta" class="pt-1 text-error!">
        {{ errors.principalAmount }}
      </UiText>
    </FormElement>

    <div class="grid grid-cols-2 gap-3">
      <FormElement>
        <template #label>
          {{ t('loans.form.annualRate') }}
        </template>
        <FormInput
          type="number"
          inputmode="decimal"
          :modelValue="form.annualRate === null ? '' : String(form.annualRate)"
          @update:modelValue="(value: string) => form.annualRate = value.trim() === '' ? null : Number(value) || 0"
        />
      </FormElement>

      <FormElement>
        <template #label>
          {{ t('loans.form.termMonths') }}
        </template>
        <FormInput
          type="number"
          inputmode="numeric"
          data-loan-form="termMonths"
          :modelValue="form.termMonths || ''"
          @update:modelValue="(value: string) => form.termMonths = Math.round(Number(value)) || 0"
        />
        <UiText v-if="errors.termMonths" variant="meta" class="pt-1 text-error!">
          {{ errors.termMonths }}
        </UiText>
      </FormElement>
    </div>

    <div class="grid grid-cols-2 gap-3">
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
          @update:modelValue="onChangeFirstPaymentDate"
        />
        <UiText v-if="errors.firstPaymentDate" variant="meta" class="pt-1 text-error!">
          {{ errors.firstPaymentDate }}
        </UiText>
      </FormElement>
    </div>

    <FormElement>
      <template #label>
        {{ t('loans.form.scheduleType') }}
      </template>
      <UiTabs
        :items="scheduleTypeOptions"
        :modelValue="form.scheduleType"
        size="sm"
        @update:modelValue="(value) => form.scheduleType = value as LoanItem['scheduleType']"
      />
    </FormElement>

    <div v-if="preview" class="grid grid-cols-3 gap-2 rounded-sm bg-elevated/30 px-3 py-2" data-loan-form-preview>
      <div class="grid">
        <UiText variant="caption">
          {{ form.scheduleType === 'annuity' ? t('loans.form.payment') : t('loans.form.firstPayment') }}
        </UiText>
        <Amount :amount="preview.payment" :currencyCode :isShowBaseRate="false" align="left" variant="secondary" />
      </div>
      <div class="grid">
        <UiText variant="caption">
          {{ t('loans.interest') }}
        </UiText>
        <Amount :amount="preview.interest" :currencyCode :isShowBaseRate="false" align="left" variant="secondary" />
      </div>
      <div class="grid">
        <UiText variant="caption">
          {{ t('loans.form.endDate') }}
        </UiText>
        <UiText variant="navigation">
          {{ preview.endDate }}
        </UiText>
      </div>
    </div>

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

    <UCollapsible v-model:open="isShowAdvanced">
      <button
        type="button"
        class="-mx-3 flex min-h-10.5 w-[calc(100%+1.5rem)] items-center gap-1 rounded-md interactive px-3 text-left"
        :aria-expanded="isShowAdvanced"
        data-loan-form-advanced
      >
        <UiTitleSection>
          {{ t('loans.form.advanced') }}
        </UiTitleSection>
        <Icon
          :name="isShowAdvanced ? 'lucide:chevron-down' : 'lucide:chevron-right'"
          class="shrink-0 text-muted"
          size="18"
        />
      </button>

      <template #content>
        <div class="grid gap-4 pt-3">
          <FormElement>
            <template #label>
              {{ t('loans.form.paymentDay') }}
            </template>
            <FormInput
              type="number"
              inputmode="numeric"
              :modelValue="String(form.paymentDay)"
              @update:modelValue="(value: string) => form.paymentDay = Math.min(31, Math.max(1, Number(value) || 1))"
            />
          </FormElement>

          <FormElement>
            <template #label>
              {{ t('loans.form.overpaymentMode') }}
            </template>
            <UiTabs
              :items="overpaymentModeOptions"
              :modelValue="form.overpaymentMode"
              size="sm"
              @update:modelValue="(value) => form.overpaymentMode = value as LoanItem['overpaymentMode']"
            />
          </FormElement>

          <FormElement>
            <template #label>
              {{ t('loans.form.interestMethod') }}
            </template>
            <UiTabs
              :items="interestMethodOptions"
              :modelValue="form.interestMethod"
              size="sm"
              @update:modelValue="(value) => form.interestMethod = value as LoanItem['interestMethod']"
            />
          </FormElement>

          <div class="grid grid-cols-2 gap-3">
            <FormElement>
              <template #label>
                {{ t('loans.form.lateAfterDays') }}
              </template>
              <FormInput
                type="number"
                inputmode="numeric"
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
                inputmode="numeric"
                :modelValue="String(form.prepayWindowDays)"
                @update:modelValue="(value: string) => form.prepayWindowDays = days(value)"
              />
            </FormElement>
          </div>

          <FormElement>
            <template #label>
              {{ t('loans.form.closedDate') }}
            </template>
            <FormDate
              clearable
              :modelValue="form.closedDate ?? null"
              :placeholder="t('loans.form.closedDateEmpty')"
              @update:modelValue="(value: number | null) => form.closedDate = value ?? undefined"
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
        </div>
      </template>
    </UCollapsible>

    <div class="flex-center">
      <UiButtonAccent class="sm:max-w-xs" @click="onSave">
        {{ t('base.save') }}
      </UiButtonAccent>
    </div>
  </div>
</template>

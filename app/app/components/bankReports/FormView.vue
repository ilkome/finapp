<script setup lang="ts">
import type { BankReportFieldKey, BankReportFields } from '~/components/bankReports/fields'
import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletType } from '~/components/wallets/types'

import { bankReportFieldGroups, draftToReport, reportToDraft } from '~/components/bankReports/fields'

const props = defineProps<{
  currencyCode: CurrencyCode
  /** Card and loan fields are behind the `loans` flag; the bank balance is for every wallet. */
  isCreditShown: boolean
  report: BankReportFields
  walletType: WalletType
}>()

const emit = defineEmits<{
  clear: []
  save: [report: BankReportFields]
}>()

const { t } = useI18n()

const draft = ref(reportToDraft(props.report, props.currencyCode))

function dayOf(key: BankReportFieldKey): number | null {
  const value = draft.value[key]
  return typeof value === 'number' ? value : null
}

const groups = computed(() => bankReportFieldGroups.filter(group =>
  group.walletType === undefined || (props.isCreditShown && group.walletType === props.walletType)))
</script>

<template>
  <div class="grid gap-6 py-4">
    <div
      v-for="group in groups"
      :key="group.id"
      :data-group="group.id"
      class="grid grid-cols-2 gap-3"
    >
      <FormElement
        v-for="field in group.fields"
        :key="field.key"
      >
        <template #label>
          {{ t(`bankReports.fields.${field.key}`) }}
        </template>
        <FormInput
          v-if="field.kind === 'amount'"
          :data-field="field.key"
          inputmode="decimal"
          :modelValue="String(draft[field.key] ?? '')"
          :placeholder="t(`bankReports.fields.${field.key}`)"
          @update:modelValue="(value: string) => draft[field.key] = String(value)"
        />
        <FormDate
          v-else
          clearable
          :data-field="field.key"
          :modelValue="dayOf(field.key)"
          :title="t(`bankReports.fields.${field.key}`)"
          @update:modelValue="(value: number | null) => draft[field.key] = value"
        />
      </FormElement>
    </div>

    <div class="flex gap-2">
      <UiButtonAccent data-action="save" @click="emit('save', draftToReport(draft, props.currencyCode))">
        {{ t('base.save') }}
      </UiButtonAccent>
      <UiButtonAccent
        color="neutral"
        data-action="clear"
        variant="ghost"
        @click="emit('clear')"
      >
        {{ t('bankReports.clear') }}
      </UiButtonAccent>
    </div>
  </div>
</template>

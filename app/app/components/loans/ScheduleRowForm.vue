<script setup lang="ts">
export type LoanScheduleRowDraft = {
  date: number
  fine: number
  interestPart: number
  paymentNumber: number
  principalPart: number
}

const props = defineProps<{
  modelValue: LoanScheduleRowDraft
}>()

const emit = defineEmits<{
  'cancel': []
  'save': []
  'update:modelValue': [value: LoanScheduleRowDraft]
}>()

const { t } = useI18n()

function patch(partial: Partial<LoanScheduleRowDraft>) {
  emit('update:modelValue', { ...props.modelValue, ...partial })
}
</script>

<template>
  <div class="grid gap-2 rounded-sm bg-elevated/30 p-3">
    <UiText variant="section">
      {{ t('loans.editRow') }}
    </UiText>

    <FormDate
      :modelValue="props.modelValue.date"
      @update:modelValue="(value: number | null) => { if (value !== null) patch({ date: value }) }"
    />
    <FormElement>
      <template #label>
        {{ t('loans.principal') }}
      </template>
      <FormInput
        type="number"
        :modelValue="String(props.modelValue.principalPart)"
        :placeholder="t('loans.principal')"
        @update:modelValue="(value: string) => patch({ principalPart: Number(value) || 0 })"
      />
    </FormElement>
    <FormElement>
      <template #label>
        {{ t('loans.interest') }}
      </template>
      <FormInput
        type="number"
        :modelValue="String(props.modelValue.interestPart)"
        :placeholder="t('loans.interest')"
        @update:modelValue="(value: string) => patch({ interestPart: Number(value) || 0 })"
      />
    </FormElement>
    <FormElement>
      <template #label>
        {{ t('loans.fine') }}
      </template>
      <FormInput
        type="number"
        :modelValue="String(props.modelValue.fine)"
        :placeholder="t('loans.fine')"
        @update:modelValue="(value: string) => patch({ fine: Number(value) || 0 })"
      />
    </FormElement>

    <div class="flex gap-2">
      <UiButtonAccent @click="emit('save')">
        {{ t('base.save') }}
      </UiButtonAccent>
      <UiButtonAccent @click="emit('cancel')">
        {{ t('base.cancel') }}
      </UiButtonAccent>
    </div>
  </div>
</template>

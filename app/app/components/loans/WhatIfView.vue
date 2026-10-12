<script setup lang="ts">
const props = defineProps<{
  currencyCode: string
  extra: number
  interestSaved: number
  mode: 'reducePayment' | 'reduceTerm'
  /** Preformatted civil day, null when the loan would already be closed. */
  newEndDate: string | null
}>()

const emit = defineEmits<{
  'update:extra': [value: number]
  'update:mode': [value: 'reducePayment' | 'reduceTerm']
}>()

const { t } = useI18n()

const modeItems = computed(() => (['reducePayment', 'reduceTerm'] as const).map(value => ({ label: t(`loans.modes.${value}`), value })))
</script>

<template>
  <div class="grid gap-2">
    <UiTitleSection>
      {{ t('loans.whatIf') }}
    </UiTitleSection>

    <div class="grid gap-1">
      <UiText variant="caption">
        {{ t('loans.extraAmount') }}, {{ props.currencyCode }}
      </UiText>
      <FormInput
        type="number"
        inputmode="decimal"
        :modelValue="String(props.extra)"
        @update:modelValue="(value: string) => emit('update:extra', Number(value) || 0)"
      />
    </div>

    <UiTabs
      :items="modeItems"
      :modelValue="props.mode"
      size="xs"
      @update:modelValue="(value) => emit('update:mode', value as typeof props.mode)"
    />

    <UiElement v-if="props.extra > 0" insideClasses="justify-between" data-loan-what-if-result>
      <UiText variant="caption">
        {{ t('loans.interestSaved') }}
      </UiText>

      <div class="flex items-baseline gap-2">
        <Amount
          :amount="props.interestSaved"
          :currencyCode="props.currencyCode"
          align="left"
          variant="secondary"
        />
        <UiText v-if="props.newEndDate" variant="meta">
          {{ props.newEndDate }}
        </UiText>
      </div>
    </UiElement>
  </div>
</template>

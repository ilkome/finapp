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

const modes = ['reducePayment', 'reduceTerm'] as const
</script>

<template>
  <div class="grid gap-2">
    <UiText variant="section">
      {{ t('loans.whatIf') }}
    </UiText>

    <FormInput
      :modelValue="String(props.extra)"
      :placeholder="t('loans.extraAmount')"
      @update:modelValue="(value: string) => emit('update:extra', Number(value) || 0)"
    />

    <div class="flex gap-2">
      <button
        v-for="item in modes"
        :key="item"
        type="button"
        class="rounded-sm px-2 py-1 text-xs"
        :class="props.mode === item ? 'bg-primary/20 text-highlighted' : 'bg-elevated/40 text-muted'"
        :data-loan-mode="item"
        @click="emit('update:mode', item)"
      >
        {{ t(`loans.modes.${item}`) }}
      </button>
    </div>

    <div class="flex items-baseline justify-between gap-2 rounded-sm bg-elevated/30 px-3 py-2">
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
    </div>
  </div>
</template>

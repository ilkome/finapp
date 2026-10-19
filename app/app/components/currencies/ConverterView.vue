<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

const props = defineProps<{
  amount: string
  /** Currencies that can be added as a target or picked as the source, already in picker order. */
  options: { code: CurrencyCode, name: string }[]
  /** Civil day of the market rates (ms); null when unknown. */
  ratesDate: number | null
  /** `value` is the formatted result with its symbol; null when the currency has no rate. */
  results: { code: CurrencyCode, value: string | null }[]
  source: CurrencyCode
}>()

const emit = defineEmits<{
  'addTarget': [code: CurrencyCode]
  'removeTarget': [code: CurrencyCode]
  'update:amount': [value: string]
  'update:source': [code: CurrencyCode]
}>()

const { locale, t } = useI18n()

const sourceOptions = computed(() => props.options.map(c => ({ label: c.code, value: c.code })))
const addOptions = computed(() => props.options
  .filter(c => c.code !== props.source && !props.results.some(r => r.code === c.code))
  .map(c => ({ label: c.name === c.code ? c.code : `${c.code} - ${c.name}`, value: c.code })))
const dateLabel = computed(() => props.ratesDate === null
  ? null
  : new Intl.DateTimeFormat(locale?.value, { dateStyle: 'medium', timeZone: 'UTC' }).format(props.ratesDate))
</script>

<template>
  <div class="grid grid-cols-1 gap-3">
    <div class="flex items-center gap-2">
      <FormInput
        class="grow"
        inputmode="decimal"
        placeholder="0"
        :modelValue="props.amount"
        @update:modelValue="(value: string) => emit('update:amount', value)"
      />
      <USelectMenu
        class="w-28"
        data-reka-swipe-ignore
        valueKey="value"
        :items="sourceOptions"
        :modelValue="props.source"
        @update:modelValue="(code: CurrencyCode) => emit('update:source', code)"
      />
    </div>

    <div>
      <div
        v-for="result in props.results"
        :key="result.code"
        class="flex min-h-10 items-center justify-between gap-3 border-b border-default/50 text-sm"
      >
        <div class="font-medium">
          {{ result.code }}
        </div>
        <div class="flex items-center gap-2 tabular-nums">
          <span v-if="result.value !== null">{{ result.value }}</span>
          <span v-else class="text-xs text-muted">{{ t('currencies.converter.noRate') }}</span>
          <UButton
            icon="lucide:x"
            size="xs"
            variant="ghost"
            color="neutral"
            :aria-label="t('base.delete')"
            @click="emit('removeTarget', result.code)"
          />
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between gap-2">
      <USelectMenu
        data-reka-swipe-ignore
        valueKey="value"
        :items="addOptions"
        :placeholder="t('currencies.converter.add')"
        :modelValue="undefined"
        @update:modelValue="(code: CurrencyCode) => emit('addTarget', code)"
      />
      <div v-if="dateLabel" class="text-xs text-muted">
        {{ t('currencies.converter.ratesOn', { date: dateLabel }) }}
      </div>
    </div>
  </div>
</template>

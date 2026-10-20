<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'

import type { CurrencyCode } from '~/components/currencies/types'

import { sortInsertLine } from '~/components/ui/sortInsertLine'

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
  'moveTarget': [code: CurrencyCode, offset: -1 | 1]
  'removeTarget': [code: CurrencyCode]
  'reorderTargets': [codes: CurrencyCode[]]
  'update:amount': [value: string]
  'update:source': [code: CurrencyCode]
}>()

const { locale, t } = useI18n()

const sourceOptions = computed(() => props.options.map(c => ({ label: c.code, value: c.code })))
const addOptions = computed(() => props.options
  .filter(c => c.code !== props.source && !props.results.some(r => r.code === c.code))
  .map(c => ({ label: c.name === c.code ? c.code : `${c.code} - ${c.name}`, value: c.code })))
const [targetsParent, sortedCodes] = useDragAndDrop([] as CurrencyCode[], {
  dragHandle: '.converterHandle',
  plugins: [sortInsertLine()],
})
const resultsByCode = computed(() => new Map(props.results.map(result => [result.code, result])))
const sortedResults = computed(() => sortedCodes.value.flatMap(code => resultsByCode.value.get(code) ?? []))
watch(() => props.results.map(result => result.code), (codes) => {
  sortedCodes.value = codes
}, { immediate: true })
watch(sortedCodes, (codes) => {
  if (codes.some((code, index) => code !== props.results[index]?.code))
    emit('reorderTargets', [...codes])
})

function menuItems(code: CurrencyCode, index: number) {
  return [[
    { disabled: index === 0, icon: 'lucide:arrow-up', label: t('currencies.converter.moveUp'), onSelect: () => emit('moveTarget', code, -1) },
    { disabled: index === props.results.length - 1, icon: 'lucide:arrow-down', label: t('currencies.converter.moveDown'), onSelect: () => emit('moveTarget', code, 1) },
  ], [
    { color: 'error' as const, icon: 'lucide:trash-2', label: t('base.delete'), onSelect: () => emit('removeTarget', code) },
  ]]
}

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

    <div ref="targetsParent">
      <UiContextMenuMy
        v-for="(result, index) in sortedResults"
        :key="result.code"
        :items="menuItems(result.code, index)"
      >
        <div
          class="flex min-h-10 items-center gap-2 border-b border-default/50 text-sm"
          :data-converter-row="result.code"
        >
          <div
            class="converterHandle -ml-1 flex size-8 shrink-0 cursor-grab items-center justify-center rounded-sm text-dimmed hover:bg-elevated/50 active:cursor-grabbing"
            :aria-label="t('currencies.converter.drag')"
          >
            <Icon name="lucide:grip-vertical" size="16" />
          </div>
          <div class="grow font-medium">
            {{ result.code }}
          </div>
          <div class="flex items-center gap-2 tabular-nums">
            <span v-if="result.value !== null">{{ result.value }}</span>
            <span v-else class="text-xs text-muted">{{ t('currencies.converter.noRate') }}</span>
            <UDropdownMenu :content="{ align: 'end' }" :items="menuItems(result.code, index)">
              <UiTriggerButton icon="lucide:ellipsis-vertical" :title="t('base.moreOptions')" />
            </UDropdownMenu>
          </div>
        </div>
      </UiContextMenuMy>
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

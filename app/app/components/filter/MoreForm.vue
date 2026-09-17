<script setup lang="ts">
import type { FilterDescMode, FilterExtras } from '~/components/filter/extras'
import type { TrnsViewType } from '~/components/trns/types'

import { getCurrencySymbol } from '~/components/amount/utils'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useExtrasLabels } from '~/components/filter/useExtrasLabels'

const extras = defineModel<FilterExtras>({ required: true })

const { t } = useI18n()
const currenciesStore = useCurrenciesStore()
const { descItems, typeItems } = useExtrasLabels()

function toNumber(value: string | number): number | null {
  const parsed = Number(value)
  return value === '' || !Number.isFinite(parsed) ? null : parsed
}
</script>

<template>
  <div class="grid h-full scroller-block content-start gap-5 overflow-y-auto px-3 pt-3 pb-20 md:px-1">
    <div class="grid gap-2">
      <div class="text-sm font-medium text-muted">
        {{ t('trns.fields.type') }}
      </div>
      <UiTabs
        :items="typeItems"
        :modelValue="extras.type"
        size="sm"
        @update:modelValue="extras = { ...extras, type: $event as TrnsViewType }"
      />
    </div>

    <div class="grid gap-2">
      <div class="text-sm font-medium text-muted">
        {{ t('trns.fields.description') }}
      </div>
      <UInput
        :modelValue="extras.descText"
        :placeholder="t('trns.filter.enterDescription')"
        size="xl"
        @update:modelValue="extras = { ...extras, descText: String($event) }"
      />
      <UiTabs
        :items="descItems"
        :modelValue="extras.desc"
        size="sm"
        @update:modelValue="extras = { ...extras, desc: $event as FilterDescMode }"
      />
    </div>

    <div class="grid gap-2">
      <div class="text-sm font-medium text-muted">
        {{ t('base.filterAmountIn', { currency: getCurrencySymbol(currenciesStore.base) }) }}
      </div>
      <div class="grid grid-cols-2 gap-2">
        <UInput
          inputmode="decimal"
          :modelValue="extras.amountMin === null ? '' : String(extras.amountMin)"
          :placeholder="t('trns.filter.minimum')"
          size="xl"
          type="number"
          @update:modelValue="extras = { ...extras, amountMin: toNumber($event) }"
        />
        <UInput
          inputmode="decimal"
          :modelValue="extras.amountMax === null ? '' : String(extras.amountMax)"
          :placeholder="t('trns.filter.maximum')"
          size="xl"
          type="number"
          @update:modelValue="extras = { ...extras, amountMax: toNumber($event) }"
        />
      </div>
    </div>
  </div>
</template>

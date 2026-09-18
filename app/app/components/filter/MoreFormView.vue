<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import type { FilterDescMode, FilterExtras } from '~/components/filter/extras'
import type { TrnsViewType } from '~/components/trns/types'

const props = defineProps<{
  amountCurrencySymbol: string
  descItems: TabsItem[]
  typeItems: TabsItem[]
}>()

const extras = defineModel<FilterExtras>({ required: true })

const { t } = useI18n()

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
        :items="props.typeItems"
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
        :items="props.descItems"
        :modelValue="extras.desc"
        size="sm"
        @update:modelValue="extras = { ...extras, desc: $event as FilterDescMode }"
      />
    </div>

    <div class="grid gap-2">
      <div class="text-sm font-medium text-muted">
        {{ t('base.filterAmountIn', { currency: props.amountCurrencySymbol }) }}
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

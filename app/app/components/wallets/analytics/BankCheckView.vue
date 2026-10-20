<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

export type BankCheckRow = {
  color: string
  currencyCode: CurrencyCode
  /** The bank's balance day, formatted. */
  dateLabel: string
  /** Bank minus calculated, in the wallet's currency. */
  diff: number
  id: string
  name: string
}

defineProps<{
  items: BankCheckRow[]
}>()

const emit = defineEmits<{
  select: [id: string]
}>()
</script>

<template>
  <div class="grid rounded-md bg-elevated/30 py-px" data-analytics-bank-check>
    <UiElement
      v-for="(item, index) in items"
      :key="item.id"
      :lineWidth="index === items.length - 1 ? 0 : 3"
      insideClasses="min-h-11!"
      :data-bank-row="item.id"
      role="button"
      tabindex="0"
      @click="emit('select', item.id)"
      @keydown.enter.space.prevent="emit('select', item.id)"
    >
      <div class="size-2.5 shrink-0 rounded-full" :style="{ background: item.color }" />
      <div class="grid min-w-0 grow gap-1">
        <div class="truncate text-sm leading-none text-muted">
          {{ item.name }}
        </div>
        <UiText variant="caption">
          {{ item.dateLabel }}
        </UiText>
      </div>
      <Amount :amount="item.diff" :currencyCode="item.currencyCode" :isShowBaseRate="false" isShowPlus variant="row" />
    </UiElement>
  </div>
</template>

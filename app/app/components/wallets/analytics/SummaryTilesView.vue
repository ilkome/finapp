<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

export type SummaryTile = {
  /** Minor units; a tile without it shows `text`. */
  amount?: number
  caption?: string
  id: string
  isShowPlus?: boolean
  label: string
  text?: string
}

const props = defineProps<{
  currencyCode: CurrencyCode
  items: SummaryTile[]
}>()
</script>

<template>
  <div class="grid grid-cols-2 gap-2 @xl/page:grid-cols-3" data-analytics-summary>
    <div
      v-for="item in props.items"
      :key="item.id"
      class="grid content-start gap-1 rounded-md bg-elevated/30 px-3 py-2"
      :data-summary-tile="item.id"
    >
      <UiText variant="caption">
        {{ item.label }}
      </UiText>
      <Amount
        v-if="item.amount !== undefined"
        :amount="item.amount"
        :currencyCode="props.currencyCode"
        :isShowBaseRate="false"
        :isShowPlus="item.isShowPlus"
        align="left"
        variant="row"
      />
      <div v-else class="text-base leading-none font-semibold text-highlighted">
        {{ item.text }}
      </div>
      <UiText v-if="item.caption" variant="meta" class="leading-snug!">
        {{ item.caption }}
      </UiText>
    </div>
  </div>
</template>

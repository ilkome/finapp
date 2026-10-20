<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

export type SummaryTile = {
  /** Minor units; a tile without it shows `text`. */
  amount?: number
  caption?: string
  /** Route location the caption links to. */
  captionTo?: { hash?: string, query?: Record<string, string> }
  id: string
  isShowPlus?: boolean
  /** The caption reads as a warning. */
  isWarning?: boolean
  label: string
  text?: string
}

const props = defineProps<{
  /** Tiles per row on a wide page; pick one that divides the tile count so no tile is left alone. */
  columns?: 3 | 4
  currencyCode: CurrencyCode
  items: SummaryTile[]
}>()
</script>

<template>
  <div class="grid grid-cols-2 gap-2" :class="props.columns === 4 ? '@xl/page:grid-cols-4' : '@xl/page:grid-cols-3'" data-analytics-summary>
    <UiCard
      v-for="item in props.items"
      :key="item.id"
      :title="item.label"
      :data-summary-tile="item.id"
    >
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
      <UiText v-if="item.caption" variant="meta" class="leading-snug!" :class="item.isWarning && 'text-warning!'">
        <NuxtLink v-if="item.captionTo" :to="item.captionTo" class="underline underline-offset-2">
          {{ item.caption }}
        </NuxtLink>
        <template v-else>
          {{ item.caption }}
        </template>
      </UiText>
    </UiCard>
  </div>
</template>

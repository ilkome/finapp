<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

export type AnalyticsLegendItem = {
  color: string
  id: string
  isHidden?: boolean
  name: string
  /** Caption of the second line, e.g. "change" or "average". */
  secondLabel?: string
  secondValue?: number
  value: number
}

const props = defineProps<{
  currencyCode: CurrencyCode
  /** Rows toggle their series on the chart. */
  isToggleable?: boolean
  items: AnalyticsLegendItem[]
}>()

const emit = defineEmits<{
  toggle: [id: string]
}>()
</script>

<template>
  <div class="grid rounded-md bg-elevated/30 py-px" data-analytics-legend>
    <UiElement
      v-for="(item, index) in props.items"
      :key="item.id"
      :lineWidth="index === props.items.length - 1 ? 0 : 3"
      insideClasses="min-h-10!"
      :class="item.isHidden && 'opacity-45'"
      :aria-pressed="props.isToggleable ? !item.isHidden : undefined"
      :data-legend-item="item.id"
      @click="props.isToggleable && emit('toggle', item.id)"
    >
      <div
        class="size-2.5 shrink-0 rounded-full"
        :class="item.isHidden && 'ring-1 ring-accented ring-inset'"
        :style="{ background: item.isHidden ? 'transparent' : item.color }"
      />

      <UiEntityName class="grow">
        {{ item.name }}
      </UiEntityName>

      <div class="grid justify-items-end gap-1 pr-1">
        <Amount
          :amount="item.value"
          :currencyCode="props.currencyCode"
          :isShowBaseRate="false"
          variant="row"
        />

        <div v-if="item.secondValue !== undefined" class="flex items-center gap-1">
          <UiText v-if="item.secondLabel" variant="caption">
            {{ item.secondLabel }}
          </UiText>
          <Amount
            :amount="item.secondValue"
            :currencyCode="props.currencyCode"
            :isShowBaseRate="false"
            isShowPlus
            variant="secondary"
          />
        </div>
      </div>
    </UiElement>
  </div>
</template>

<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

export type AnalyticsShareRow = {
  color: string
  /** Wallets in the group; shown for type and currency groups. */
  count?: number
  id: string
  name: string
  share: number
  signedValue: number
}

const props = defineProps<{
  currencyCode: CurrencyCode
  items: AnalyticsShareRow[]
  totalLabel: string
  totalValue: number
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const percent = (share: number) => `${Math.round(share * 1000) / 10}%`
</script>

<template>
  <div class="grid gap-2" data-analytics-shares>
    <div class="grid rounded-md bg-elevated/30 py-px">
      <UiElement
        v-for="(item, index) in props.items"
        :key="item.id"
        :lineWidth="index === props.items.length - 1 ? 0 : 3"
        insideClasses="min-h-10!"
        :data-share-item="item.id"
        role="button"
        tabindex="0"
        @click="emit('select', item.id)"
        @keydown.enter.space.prevent="emit('select', item.id)"
      >
        <div class="size-2.5 shrink-0 rounded-full" :style="{ background: item.color }" />

        <div class="flex min-w-0 grow items-baseline gap-2 text-sm leading-none text-muted">
          <span class="truncate">{{ item.name }}</span>
          <span v-if="item.count" class="text-2xs text-dimmed">{{ item.count }}</span>
        </div>

        <div class="w-12 text-right text-xs leading-none text-muted tabular-nums" data-share-percent>
          {{ percent(item.share) }}
        </div>

        <Amount
          :amount="item.signedValue"
          :currencyCode="props.currencyCode"
          :isShowBaseRate="false"
          class="pr-1"
          variant="row"
        />
        <Icon name="lucide:chevron-right" size="16" class="shrink-0 text-dimmed" aria-hidden="true" />
      </UiElement>

      <div class="flex items-center gap-3 px-3 py-2.5">
        <UiText variant="meta" class="grow">
          {{ props.totalLabel }}
        </UiText>
        <Amount
          :amount="props.totalValue"
          :currencyCode="props.currencyCode"
          :isShowBaseRate="false"
          variant="row"
        />
      </div>
    </div>
  </div>
</template>

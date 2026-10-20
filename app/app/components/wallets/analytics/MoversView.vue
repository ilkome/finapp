<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

export type MoverRow = {
  color: string
  current: number
  delta: number
  /** Formatted change in percent; absent for a category new in this period. */
  deltaLabel?: string
  icon: string
  id: string
  /** One trn makes most of the change. */
  isOneOff?: boolean
  name: string
}

const props = defineProps<{
  currencyCode: CurrencyCode
  items: MoverRow[]
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const { t } = useI18n()
</script>

<template>
  <div class="grid rounded-md bg-elevated/30 py-px" data-analytics-movers>
    <UiElement
      v-for="(item, index) in props.items"
      :key="item.id"
      :lineWidth="index === props.items.length - 1 ? 0 : 3"
      insideClasses="min-h-11!"
      :data-mover="item.id"
      role="button"
      tabindex="0"
      @click="emit('select', item.id)"
      @keydown.enter.space.prevent="emit('select', item.id)"
    >
      <Icon :name="item.icon" size="18" :style="{ color: item.color }" class="shrink-0" />

      <div class="flex min-w-0 grow items-center gap-2 text-sm leading-none text-muted">
        <span class="truncate">{{ item.name }}</span>
        <UBadge v-if="item.isOneOff" color="neutral" variant="subtle" size="sm" :label="t('wallets.analytics.movers.oneOff')" data-mover-one-off />
      </div>

      <div class="grid justify-items-end gap-1 pr-1">
        <Amount :amount="-item.current" :currencyCode="props.currencyCode" :isShowBaseRate="false" variant="row" />
        <div class="flex items-center gap-1" :class="item.delta > 0 ? 'text-expense-1' : 'text-income-1'">
          <Amount :amount="item.delta" :currencyCode="props.currencyCode" :isShowBaseRate="false" isShowPlus variant="secondary" />
          <UiText v-if="item.deltaLabel" variant="caption">
            {{ item.deltaLabel }}
          </UiText>
        </div>
      </div>
    </UiElement>
  </div>
</template>

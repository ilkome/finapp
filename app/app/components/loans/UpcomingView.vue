<script setup lang="ts">
import type { TrnItemFull } from '~/components/trns/types'

import { useStoredToggle } from '~/composables/useStoredToggle'

export type LoansUpcomingViewItem = {
  trnItem: TrnItemFull
  walletId: string
}

export type LoansUpcomingViewGroup = {
  days: {
    date: number
    items: LoansUpcomingViewItem[]
    /** Day total in the base currency; null for a single-charge day. */
    sum: number | null
  }[]
  key: string
  label: string
}

const props = defineProps<{
  baseCurrencyCode: string
  groups: LoansUpcomingViewGroup[]
  isOverdue: boolean
  /** Overdue plus due within a month, in the base currency. */
  total: number | null
}>()

const emit = defineEmits<{
  select: [walletId: string]
}>()

const { t } = useI18n()

const groupKeys = ['overdue', 'nearest', 'week', 'month', 'later']
const isOpen = Object.fromEntries(groupKeys.map(key => [key, useStoredToggle(`loans-to-pay-${key}`, true)]))
</script>

<template>
  <div v-if="props.groups.length" class="grid gap-1" data-loan-upcoming>
    <div class="flex flex-wrap items-baseline gap-x-2 px-3">
      <UiText variant="caption">
        {{ t('loans.toPay.title') }}
      </UiText>

      <Amount
        v-if="props.total !== null"
        :amount="props.total"
        :currencyCode="props.baseCurrencyCode"
        :isShowBaseRate="false"
        :class="props.isOverdue && 'text-error!'"
        align="left"
        data-loan-upcoming-total
        variant="summary"
      />
    </div>

    <UCollapsible
      v-for="group in props.groups"
      :key="group.key"
      :open="group.key === 'nearest' || isOpen[group.key]!.value"
      :unmountOnHide="false"
      :data-loan-upcoming-group="group.key"
      @update:open="(value: boolean) => isOpen[group.key]!.value = value"
    >
      <!-- The nearest day already prints its date in the day row below. -->
      <UiTitleCollapse v-if="group.key !== 'nearest'" :isShown="isOpen[group.key]!.value" :class="group.key === 'overdue' && 'text-error'">
        {{ group.label }}
      </UiTitleCollapse>

      <template #content>
        <div v-for="day in group.days" :key="day.date">
          <TrnsDateRowView
            :currencyCode="props.baseCurrencyCode"
            :date="day.date"
            :isShowGroupSum="day.sum !== null"
            :sum="day.sum === null ? undefined : { expense: day.sum, income: 0 }"
          />
          <TrnsItem
            v-for="item in day.items"
            :key="item.trnItem.id"
            :trnItem="item.trnItem"
            data-loan-upcoming-item
            @click="emit('select', item.walletId)"
          />
        </div>
      </template>
    </UCollapsible>
  </div>
</template>

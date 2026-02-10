<script setup lang="ts">
import type { AmountProps } from '~/components/amount/Amount.vue'
import type { SeriesSlugSelected } from '~/components/stat/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'

const props = defineProps<{
  amount: number
  amountProps?: Partial<AmountProps>
  averageTotal?: Record<string, number>
  currencyCode?: string
  isActive?: boolean
  isTotal?: boolean
  title?: string
  type: SeriesSlugSelected
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()

const { t } = useI18n()
const currenciesStore = useCurrenciesStore()
</script>

<template>
  <div
    class="flex-1 grow flex-wrap rounded-sm border border-transparent bg-[var(--item-3)] px-2 py-2 @2xl/page:max-w-max @2xl/page:px-4 @2xl/page:py-2"
    :class="{
      '!bg-item-2 !border-(--ui-primary)/40': props.isActive,
    }"
    @click="(e: Event) => emit('click', e)"
  >
    <div class="flex items-end gap-5">
      <div class="grid gap-1">
        <UiTitle6 v-if="props.title">
          {{ props.title }}
        </UiTitle6>

        <UiTitle6 v-if="!props.title">
          {{ props.isTotal ? $t('money.all') : '' }}
          {{ $t(`money.${props.type}`) }}
        </UiTitle6>

        <Amount
          :amount="props.amount"
          :currencyCode="props.currencyCode || currenciesStore.base"
          :class="{
            '!text-income-1': props.amount > 0 && props.type !== 'netIncome',
            '!text-expense-1': props.amount < 0 && props.type !== 'netIncome',
          }"
          align="left"
          variant="xl"
          v-bind="props.amountProps"
        />
      </div>

      <slot />

      <div
        v-if="props.averageTotal"
        class="flex gap-5"
      >
        <div
          v-for="(averageItem, slug) in props.averageTotal"
          :key="averageItem"
          class="grid gap-1 pb-[2px]"
        >
          <UiTitle6>{{ t('money.average') }} <br> {{ t(`dates.${slug}.simple`) }}</UiTitle6>

          <Amount
            :amount="type === 'expense' ? -averageItem : averageItem"
            :currencyCode="currenciesStore.base"
            :class="{
              '!text-income-1': type === 'income',
              '!text-expense-1': type === 'expense',
            }"
            align="left"
          />
        </div>
      </div>
    </div>
  </div>
</template>

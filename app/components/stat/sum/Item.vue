<script setup lang="ts">
import type { SeriesSlugSelected } from '~/components/stat/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'

const props = defineProps<{
  amount: number
  averageTotal?: Record<string, number>
  isActive?: boolean
  plain?: boolean
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
    :class="cn(
      props.plain
        ? 'px-1 pb-1'
        : 'flex-1 flex-wrap rounded-sm border border-transparent bg-elevated/30 px-3 py-2 @2xl/stat:max-w-max',
      props.isActive && 'bg-elevated/30 border-primary/40',
    )"
    @click="(e: Event) => emit('click', e)"
  >
    <div class="flex items-end gap-5">
      <div class="grid gap-1">
        <UiTextSubtitle>
          {{ props.title ?? t(`money.${props.type}`) }}
        </UiTextSubtitle>

        <Amount
          :amount="props.amount"
          :currencyCode="currenciesStore.base"
          :class="{
            '!text-income-1': props.amount > 0 && props.type !== 'netIncome',
            '!text-expense-1': props.amount < 0 && props.type !== 'netIncome',
            '!text-2xl': props.plain,
          }"
          align="left"
          variant="xl"
        />
      </div>

      <slot />

      <div
        v-if="props.averageTotal"
        class="flex gap-5"
      >
        <div
          v-for="(averageItem, slug) in props.averageTotal"
          :key="slug"
          class="grid gap-1 pb-[2px]"
        >
          <UiTextSubtitle>{{ t('money.average') }} <br> {{ t(`dates.${slug}.simple`) }}</UiTextSubtitle>

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

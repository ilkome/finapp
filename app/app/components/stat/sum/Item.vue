<script setup lang="ts">
import type { SeriesSlugSelected } from '~/components/stat/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'

const props = defineProps<{
  amount: number
  averageTotal?: Record<string, number>
  currencyCode?: string
  isActive?: boolean
  title?: string
  type: SeriesSlugSelected
  variant?: 'default' | 'plain' | 'summary'
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
      props.variant === 'plain'
        ? 'px-1 pb-1'
        : props.variant === 'summary'
          ? 'relative flex h-14 items-center rounded-sm border border-transparent bg-elevated/30 px-3 py-0.5'
          : 'flex-1 flex-wrap rounded-sm border border-transparent bg-elevated/30 px-3 py-2 @2xl/stat:max-w-max',
      props.isActive && 'border-primary/40 bg-elevated/30',
    )"
    @click="(e: Event) => emit('click', e)"
  >
    <div :class="props.variant === 'summary' ? 'flex w-full items-center gap-5' : 'flex items-end gap-5'">
      <div class="grid gap-1">
        <UiText variant="caption">
          {{ props.title ?? t(`money.${props.type}`) }}
        </UiText>

        <Amount
          :amount="props.amount"
          :currencyCode="props.currencyCode ?? currenciesStore.base"
          :class="{
            'text-income-1!': props.amount > 0 && props.type !== 'net',
            'text-expense-1!': props.amount < 0 && props.type !== 'net',
          }"
          align="left"
          :variant="props.variant === 'plain' ? 'display' : 'summary'"
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
          class="grid gap-1 pb-0.5"
        >
          <UiText variant="caption">
            {{ t('money.average') }} <br> {{ t(`dates.${slug}.simple`) }}
          </UiText>

          <Amount
            :amount="type === 'expense' ? -averageItem : averageItem"
            :currencyCode="currenciesStore.base"
            :class="{
              'text-income-1!': type === 'income',
              'text-expense-1!': type === 'expense',
            }"
            align="left"
          />
        </div>
      </div>
    </div>
  </div>
</template>

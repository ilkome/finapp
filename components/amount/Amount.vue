<script setup lang="ts">
import useAmount from '~/components/amount/useAmount'
import {
  formatAmount,
  getCurrencySymbol,
} from '~/components/amount/formatAmount'
import type { MoneyTypeNumber, MoneyTypeSlug } from '~/components/stat/types'

const props = withDefaults(
  defineProps<{
    amount: number
    currencyCode: string
    colorize?: MoneyTypeSlug
    type?: MoneyTypeNumber
    align?: 'left' | 'center'
    isShowBaseRate?: boolean
    isShowSign?: boolean
    size?: 'sm' | 'base' | 'md' | 'lg'
  }>(),
  {
    isShowBaseRate: true,
    isShowSign: true,
  },
)

const emit = defineEmits<{
  click: [e: Event]
}>()

const { baseCurrencyCode, getAmountInBaseRate } = useAmount()
const sign = props.type === 0 ? '-' : '+'

const alignClasses = computed(() => ({
  'justify-end': !props.align,
  'justify-start': props.align === 'left',
  'justify-center': props.align === 'center',
}))

const amountClasses = computed(() => [
  { '!text-income': props.colorize === 'income' && props.type === 1 },
  { '!text-expense': props.colorize === 'expense' && props.type === 0 },
])
</script>

<template>
  <div class="flex flex-col gap-1 font-secondary text-primary" @click="(e) => emit('click', e)">
    <!-- Amount -->
    <div v-if="amount !== 0" :class="amountClasses">
      <!-- Original -->
      <div
        class="flex items-baseline gap-1 whitespace-nowrap"
        :class="alignClasses"
      >
        <div v-if="isShowSign && sign === '-'" class="leading-none">
          {{ sign }}
        </div>

        <div class="leading-none">
          {{ formatAmount(amount, currencyCode) }}
        </div>

        <div class="text-xs leading-none">
          {{ getCurrencySymbol(currencyCode) }}
        </div>
      </div>

      <!-- Base -->
      <div
        v-if="isShowBaseRate && currencyCode !== baseCurrencyCode"
        class="flex items-baseline gap-1 whitespace-nowrap text-secondary"
        :class="alignClasses"
      >
        <div v-if="isShowSign && sign === '-'" class="text-xs leading-none">
          {{ sign }}
        </div>
        <div class="text-xs leading-none">
          {{ getAmountInBaseRate({ amount, currencyCode }) }}
        </div>
        <div class="text-2xs leading-none">
          {{ getCurrencySymbol(baseCurrencyCode) }}
        </div>
      </div>
    </div>

    <!-- 0 -->
    <div
      v-if="amount === 0"
      class="flex items-baseline gap-1 whitespace-nowrap"
      :class="alignClasses"
    >
      <div class="text-md flex items-baseline leading-none">
        0
      </div>
      <div class="text-xs leading-none">
        {{ getCurrencySymbol(currencyCode) }}
      </div>
    </div>
  </div>
</template>

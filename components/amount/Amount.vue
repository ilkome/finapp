<script setup lang="ts">
import { formatAmount, getCurrencySymbol } from '~/components/amount/formatAmount'
import useAmount from '~/components/amount/useAmount'
import type { MoneyTypeNumber, MoneyTypeSlug } from '~/components/stat/types'

const props = withDefaults(
  defineProps<{
    align?: 'left' | 'center'
    amount: number
    colorize?: MoneyTypeSlug
    currencyCode: string
    isShowBaseRate?: boolean
    isShowSign?: boolean
    type?: MoneyTypeNumber
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
  'justify-center': props.align === 'center',
  'justify-end': !props.align,
  'justify-start': props.align === 'left',
}))

const amountClasses = computed(() => [
  { '!text-income': props.colorize === 'income' && props.type === 1 },
  { '!text-expense': props.colorize === 'expense' && props.type === 0 },
])
</script>

<template>
  <div
    class="flex flex-col gap-1 font-secondary text-primary"
    @click="(e) => emit('click', e)"
  >
    <!-- Not 0 -->
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
        <div v-if="isShowSign && sign === '-'" class="text-2xs leading-none">
          {{ sign }}
        </div>
        <div class="text-xs leading-none">
          {{ getAmountInBaseRate({ amount, currencyCode }) }}
        </div>
        <div class="text-xs leading-none">
          {{ getCurrencySymbol(baseCurrencyCode) }}
        </div>
      </div>
    </div>

    <!-- 0 -->
    <div
      v-if="amount === 0"
      :class="alignClasses"
      class="flex items-baseline gap-1 whitespace-nowrap"
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

<script setup lang="ts">
import type { AmountProps } from '~/components/amount/Amount.vue'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import type { MoneyTypeSlugNew } from '~/components/stat/types'

const props = defineProps<{
  amount: number
  amountProps?: Partial<AmountProps>
  averageTotal?: number
  currencyCode?: string
  isActive?: boolean
  isTotal?: boolean
  type: MoneyTypeSlugNew
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()

const { t } = useI18n()
const currenciesStore = useCurrenciesStore()
</script>

<template>
  <div
    class="grid gap-1 border border-transparent px-3 py-2"
    :class="{
      '!border-accent-1/40 !bg-item-9': props.isActive,
    }"
    @click="(e: Event) => emit('click', e)"
  >
    <UiTitle1>
      {{ props.isTotal ? $t('money.all') : '' }}
      {{ $t(`money.${props.type}`) }}
    </UiTitle1>

    <div class="flex items-end gap-5">
      <Amount
        :amount="props.amount"
        :currencyCode="props.currencyCode || currenciesStore.base"
        :class="{
          '!text-income-1': props.amount > 0 && type !== 'summary',
          '!text-expense-1': props.amount < 0 && type !== 'summary',
        }"
        align="left"
        variant="xl"
        v-bind="props.amountProps"
      />

      <div
        v-if="props.averageTotal"
        class="grid gap-1 pb-[2px]"
      >
        <UiTitle6>{{ t('money.average') }}</UiTitle6>

        <Amount
          :amount="props.averageTotal"
          :currencyCode="currenciesStore.base"
          :class="{
            '!text-income-1': props.amount > 0 && type !== 'summary',
            '!text-expense-1': props.amount < 0 && type !== 'summary',
          }"
          align="left"
        />
      </div>
    </div>
  </div>
</template>

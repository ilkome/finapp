<script setup lang="ts">
import type { AmountProps } from '~/components/amount/Amount.vue'
import type { StatTabSlug } from '~/components/stat/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'

const props = defineProps<{
  amount: number
  amountProps?: Partial<AmountProps>
  averageTotal?: Record<string, number>
  currencyCode?: string
  isActive?: boolean
  isTotal?: boolean
  type: StatTabSlug
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()

const { t } = useI18n()
const currenciesStore = useCurrenciesStore()
</script>

<template>
  <div
    class="grid gap-1 border border-transparent px-3 pt-2"
    :class="{
      '!border-accent-1/40 !bg-item-9': props.isActive,
    }"
    @click="(e: Event) => emit('click', e)"
  >
    <UiTextSm1>
      {{ props.isTotal ? $t('money.all') : '' }}
      {{ $t(`money.${props.type}`) }}
    </UiTextSm1>

    <div class="flex items-end gap-5 overflow-hidden overflow-x-auto pb-2">
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

<i18n lang="yaml">
  en:
    in: in

  ru:
    in: в
  </i18n>

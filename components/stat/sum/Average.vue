<script setup lang="ts">
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'

const props = withDefaults(defineProps<{
  amount: number
  title: string
  type?: number
}>(), {
  type: 3,
})

const currenciesStore = useCurrenciesStore()

const classes = computed(() => ({
  '_expense': props.type === 0,
  '_income': props.type === 1,
  'pb-[2px]': true,
}))
</script>

<template lang="pug">
.summaryItem(:class="classes")
  .summaryItem__title(class="pb-[2px]") {{ title }}
  .summaryItem__amount.text-item-base
    Amount(
      :amount="amount"
      :currencyCode="currenciesStore.base"
      :type="type"
      :colorize="type === 0 ? 'expense' : 'income'"
      :isShowBaseRate="false"
      :isShowSign="false"
    )
  .summaryItem__line
</template>

<style lang="stylus" scoped>
@import "../assets/stylus/variables"

.summaryItem
  position relative
  display flex
  flex-flow column

  &._expense
    color var(--c-expense-1)

  &._income
    color var(--c-income-1)

  &__title
    color var(--c-font-4)
    font-size 10px
    white-space nowrap

  &__line
    position absolute
    top 50%
    right 0
    width 1px
    height 20px
    background var(--c-bg-6)
    transform translateY(-50%)

    ~/:last-child &
      display none
</style>

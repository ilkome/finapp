<script>
import { computed, useContext } from '@nuxtjs/composition-api'
import useCalculator from '~/components/trnForm/calculator/useCalculator'

export default {
  name: 'TrnFormAmountPc',

  setup () {
    const { store } = useContext()
    const { isSum, getResult, expression } = useCalculator()
    const amountType = computed(() => store.state.trnForm.values.amountType)

    return {
      amountType,
      isSum,
      getResult,
      expression,
      className: computed(() => ({
        _expenses: amountType.value === 0,
        _incomes: amountType.value === 1
      }))
    }
  }
}
</script>

<template lang="pug">
.amountInputLaptop(:class="className")
  .trnFormAmountPc
    TrnFormTypes

    .trnFormAmount(:class="className")
      .trnFormAmount__value {{ expression }}
      .trnFormAmount__evaluation {{ isSum ? null : getResult }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.amountInputLaptop
  &__evaluation
    opacity .8
    height 12px
    margin-top (- $m7)
    margin-bottom $m7
    padding-right $m9
    font-size 14px
    text-align right

    ^[0]._expenses &
      color var(--c-expenses-1)

    ^[0]._incomes &
      color var(--c-incomes-1)

.trnFormAmountPc
  background var(--c-bg-3)
  border-top 1px solid var(--c-bg-2)
  border-bottom 1px solid var(--c-bg-2)

.trnFormAmount._incomes .trnFormAmountPc__input__value
  color var(--c-incomes-1)

.trnFormAmount._expenses .trnFormAmountPc__input__value
  color var(--c-expenses-1)

.trnFormAmount
  padding $m8 $m9
  text-align right

  &._expenses
    color var(--c-expenses-1)

  &._incomes
    color var(--c-incomes-1)

  &__value
    typo-money()
    font-size 42px !important
    font-weight 500
    line-height 32px
    word-break break-word
    white-space normal
    text-align right
    background none
    border none

    ^[0]._expenses &
      color var(--c-expenses-1)

    ^[0]._incomes &
      color var(--c-incomes-1)

  &__evaluation
    opacity .8
    height 12px
    font-size 14px
</style>

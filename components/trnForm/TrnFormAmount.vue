<script>
import { computed, useContext } from '@nuxtjs/composition-api'
import useCalculator from '~/components/trnForm/calculator/useCalculator'

export default {
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
  },

  methods: {
    handleChangeAmountType () {
      let nextAmountType = 0

      switch (this.amountType) {
        case 0:
          nextAmountType = 1
          break
        case 1:
          if (this.$store.getters['wallets/walletsSortedIds'].length > 1) {
            nextAmountType = 0
          }
          break
      }

      this.$store.commit('trnForm/setTrnFormValues', {
        amountType: nextAmountType
      })
    }
  }
}
</script>

<template lang="pug">
.trnFormAmount(:class="className")
  .trnFormAmount__wrap(@click="handleChangeAmountType")
    .trnFormAmount__in
      .trnFormAmount__content
        .trnFormAmount__evaluation {{ isSum ? null : getResult }}
        .trnFormAmount__value {{ expression }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.trnFormAmount
  &__wrap
    padding $m7 $m7
    padding-top $m6
    text-align right

    ^[0]._expenses &
      color var(--c-expenses-1)

    ^[0]._incomes &
      color var(--c-incomes-1)

  &__in
    display flex
    justify-content center

  &__content
    flex-grow 1

  &__value
    typo-money()
    padding 0
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
    height 14px
    font-size 14px
</style>

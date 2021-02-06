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
            nextAmountType = 2
          }
          break
        case 2:
          nextAmountType = 0
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
      .trnFormAmount__icon
        .mdi.mdi-minus(v-if="amountType === 0")
        .mdi.mdi-plus(v-if="amountType === 1")
        .mdi.mdi-swap-horizontal(v-if="amountType === 2")

      .trnFormAmount__content
        .trnFormAmount__type
          template(v-if="amountType === 0") {{ $t('money.expenses') }}
          template(v-if="amountType === 1") {{ $t('money.incomes') }}
          template(v-if="amountType === 2 && $store.getters['wallets/walletsSortedIds'].length > 1") {{ $t('money.transfer') }}

        .trnFormAmount__value {{ expression }}
        .trnFormAmount__evaluation {{ isSum ? null : getResult }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/fonts'
@import '~assets/stylus/variables/margins'
@import '~assets/stylus/variables/media'

.trnFormAmount
  &__wrap
    padding $m7 $m7
    text-align right

    ^[0]._expenses &
      color var(--c-expenses-1)

    ^[0]._incomes &
      color var(--c-incomes-1)

  &__in
    display flex
    align-items center
    justify-content center

  &__icon
    padding-right $m6
    font-size 32px

  &__type
    align-self center
    padding-bottom $m6
    color var(--c-font-3)

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
    height 12px
    font-size 14px
</style>

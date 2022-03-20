<script>
import useCalculator from '~/components/trnForm/calculator/useCalculator'

export default {
  setup() {
    const { $store } = useNuxtApp()
    const { isSum, getResult, expression } = useCalculator()
    const amountType = computed(() => $store.state.trnForm.values.amountType)

    return {
      amountType,
      isSum,
      getResult,
      expression,
      className: computed(() => ({
        _expenses: amountType.value === 0,
        _incomes: amountType.value === 1,
      })),
    }
  },

  methods: {
    handleChangeAmountType() {
      let nextAmountType = 0

      switch (this.amountType) {
        case 0:
          nextAmountType = 1
          break
        case 1:
          if (this.$store.getters['wallets/walletsSortedIds'].length > 1)
            nextAmountType = 0
          break
      }

      this.$store.commit('trnForm/setTrnFormValues', {
        amountType: nextAmountType,
      })
    },
  },
}
</script>

<template lang="pug">
.trnFormAmount(:class="className")
  .trnFormAmount__wrap.text-center.px-4.flex.items-center.flex-col.justify-center(
    class="h-[46px]"
    @click="handleChangeAmountType"
  )
    .trnFormAmount__value(class="!text-4xl") {{ expression }}
    .trnFormAmount__evaluation(v-if="!isSum") {{ isSum ? null : getResult }}
</template>

<style lang="stylus" scoped>
.trnFormAmount
  &__wrap
    ^[0]._expenses &
      color var(--c-expenses-1)
    ^[0]._incomes &
      color var(--c-incomes-1)

  &__value
    typo-money()
    padding 0
    font-weight 500
    line-height 32px
    word-break break-word
    white-space normal
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

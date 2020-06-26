<script>
export default {
  computed: {
    amountString () {
      return this.$store.state.trnForm.values.amount
    },

    amountType () {
      return this.$store.state.trnForm.values.amountType
    },

    className () {
      return {
        _expenses: this.amountType === 0,
        _incomes: this.amountType === 1
      }
    }
  },

  watch: {
    amountString: {
      handler (newValue, oldValue) {
        this.amountValue = newValue !== '0' ? newValue : null
      },
      immediate: true
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
  //- mobile
  template(v-if="$store.state.ui.mobile")
    .trnFormAmount__in(@click="handleChangeAmountType")
      .trnFormAmount__type
        template(v-if="amountType === 0") {{ $lang.money.expenses }}
        template(v-if="amountType === 1") {{ $lang.money.incomes }}
        template(v-if="amountType === 2 && $store.getters['wallets/walletsSortedIds'].length > 1") {{ $lang.money.transfer }}

      .trnFormAmount__content
        .trnFormAmount__value {{ amountString }}
        .trnFormAmount__evaluation {{ $store.state.trnForm.values.amountEvaluation }}
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/fonts"
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

.trnFormAmount
  &__in
    padding $m7 $m7
    text-align right

    ^[0]._expenses &
      color var(--c-expenses-1)

    ^[0]._incomes &
      color var(--c-incomes-1)

  &__type
    align-self center
    padding-bottom $m6

  &__content
    //

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

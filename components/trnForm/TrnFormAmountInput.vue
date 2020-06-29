<script>
import { evaluate } from 'mathjs'
import Button from '~/components/shared/button/Button'

export default {
  name: 'TrnFormAmountInput',

  components: {
    Button
  },

  computed: {
    amountString () {
      return this.$store.state.trnForm.values.amount
    },

    amountType () {
      return this.$store.state.trnForm.values.amountType
    },

    isShowTrnForm () {
      return this.$store.state.trnForm.show
    },

    amounIsNumber () {
      if (!this.amountString || this.amountString == 0) { return true }
      const amountString = String(this.amountString).replace(/\s/g, '')
      if (Number(amountString)) {
        return true
      }
      return false
    },

    className () {
      return {
        _expenses: this.amountType === 0,
        _incomes: this.amountType === 1
      }
    }
  },

  watch: {
    isShowTrnForm (isShow) {
      if (isShow) {
        setTimeout(() => {
          this.$refs.amountInput.focus()
        }, 300)
      }
    }
  },

  methods: {
    setCaretPosition (element) {
      setTimeout(() => {
        element.target.setSelectionRange(element.target.value.length, element.target.value.length)
      }, 1)
    },

    setAmountType (amountType) {
      this.$store.commit('trnForm/setTrnFormValues', {
        amountType
      })
    },

    changeValue (event) {
      const value = event.target.value
      if (value) {
        const lastItem = value.length > 0 ? value.slice(-1) : value
        if (/[\d*+\-*/]/g.test(Number(lastItem))) {
          this.$store.commit('trnForm/setTrnFormValues', {
            amount: value,
            amountEvaluation: this.evaluateAmount(value)
          })
        }
      }
      else {
        this.$store.commit('trnForm/setTrnFormValues', {
          amount: '',
          amountEvaluation: null
        })
      }
    },

    handleMath () {
      if (this.$store.state.trnForm.values.amount) {
        const amount = this.$store.state.trnForm.values.amount
        this.$store.commit('trnForm/setTrnFormValues', {
          amount: this.evaluateAmount(amount),
          amountEvaluation: null
        })
      }
    },

    evaluateAmount (amount) {
      try {
        const amountString = String(amount).replace(/\s+/g, '')

        if (amountString.search((/(\D)/)) !== -1) {
          const lastItem = amountString.slice(-1)
          const isLastItemNumber = (/(\d)/).test(lastItem)
          let sum = ''
          isLastItemNumber
            ? sum = evaluate(amountString)
            : sum = evaluate(amountString.slice(0, -1))

          return `${Math.round(Math.abs(sum))}`
        }
      }
      catch (error) {
        console.log(error)
        // this.$notify({
        //   type: 'error',
        //   text: this.$t('trnForm.empty'),
        //   title: random(errorEmo)
        // })
      }
    }
  }
}
</script>

<template lang="pug">
.amountInputLaptop(:class="className")
  .trnFormAmountPc
    .trnFormAmountPc__types
      .trnFormAmountPc__type._expenses(
        @click="() => setAmountType(0)"
        :class="{ _active: amountType === 0 }"
      ) {{ $lang.money.expenses }}

      .trnFormAmountPc__type._incomes(
        @click="() => setAmountType(1)"
        :class="{ _active: amountType === 1 }"
      ) {{ $lang.money.incomes }}

      .trnFormAmountPc__type(
        v-if="$store.getters['wallets/walletsSortedIds'].length > 1"
        @click="() => setAmountType(2)"
        :class="{ _active: amountType === 2 }"
      ) Transfer

    .trnFormAmountPc__input
      input.trnFormAmountPc__input__value(
        placeholder="0"
        ref="amountInput"
        :value="amountString == 0 ? '' : amountString"
        @input="changeValue"
        @focus="setCaretPosition"
      )

    .amountInputLaptop__evaluation
      template(v-if="$store.state.trnForm.values.amount != 0 && $store.state.trnForm.values.amount != $store.state.trnForm.values.amountEvaluation") {{ $store.state.trnForm.values.amountEvaluation }}

  .action
    template(v-if="!amountString")
      Button(
        className="_grey _text-center"
        size="lg"
        title="Write amount"
        @onClick="handleMath"
      )

    template(v-if="amounIsNumber")
      Button(
        v-if="$store.state.trnForm.values.trnId"
        title="Edit transaction"
        className="_blue _text-center"
        size="lg"
        @onClick="$emit('onFormSubmit')"
      )
      Button(
        v-else
        :title="$store.state.trnForm.values.amountType === 2 ? 'Create transfer' : 'Create transaction'"
        className="_blue _text-center"
        size="lg"
        @onClick="$emit('onFormSubmit')"
      )

    template(v-if="amountString && !amounIsNumber")
      Button(
        className="_blue _text-center"
        size="lg"
        title="Calculate"
        @onClick="handleMath"
      )
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/fonts"
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

.amountInputLaptop
  &__evaluation
    opacity .8
    margin-top (- $m7)
    margin-bottom $m7
    padding-right $m9
    height 12px
    font-size 14px
    text-align right

    ^[0]._expenses &
      color var(--c-expenses-1)

    ^[0]._incomes &
      color var(--c-incomes-1)

.action
  padding $m7
  padding-bottom $m7

.trnFormAmountPc
  background var(--c-bg-2)
  border-top 1px solid var(--c-bg-1)
  border-bottom 1px solid var(--c-bg-1)

  &__types
    display flex
    justify-content space-between
    padding $m8 $m9
    padding-bottom $m5

  &__type
    padding $m6 $m7
    margin (- $m6) (- $m7)
    font-header-1()
    color var(--c-font-4)

    &:hover
      @media $media-laptop
        color var(--c-font-4)
        background var(--c-bg-5)

    &._active
      opacity 1
      color var(--c-font-2)

      &:hover
        @media $media-laptop
          background none

      &._incomes
        color var(--c-incomes-1)

      &._expenses
        color var(--c-expenses-1)

  &__input
    position relative

    &__value
      z-index 2
      position relative
      width 100%
      padding $m8 $m9
      color var(--c-font-2)
      font-header-1()
      font-size 36px
      font-weight 500
      text-align right
      background 0
      border 0

.trnFormAmount._incomes .trnFormAmountPc__input__value
  color var(--c-incomes-1)

.trnFormAmount._expenses .trnFormAmountPc__input__value
  color var(--c-expenses-1)
</style>

<script>
import { evaluate } from 'mathjs'

export default {
  computed: {
    amountString () {
      return String(this.$store.state.trnForm.values.amount)
    },

    amounIsNumber () {
      if (this.amountString == 0) { return true }
      return Number(String(this.amountString).replace(/\s+/g, ''))
    },

    submitClassName () {
      const amountSplit = this.amountString.split(/(\/|\*|-|\+)/).filter(i => i)
      return {
        _zero: +this.amountString === 0,
        _math: +this.amountString !== 0 && amountSplit.length > 1
      }
    },

    buttonName () {
      if (this.submitClassName._zero) {
        return 'Write amount'
      }
      else if (this.submitClassName._math) {
        return `Calculate ${this.amountEvaluation}`
      }
      return 'name'
    }
  },

  methods: {
    formatToAmountWithSpaces (value) {
      return Number(Math.abs(value)).toLocaleString('ru-RU')
    },

    handlePress (event, eventType) {
      const amount = this.amountString
      const value = event.target.textContent
      const isValueNumber = (/(\d)/).test(value)
      const amountSplit = amount.split(/(\/|\*|-|\+)/).filter(i => i)
      const lastItem = [...amountSplit].reverse()[0]
      const isLastItemNumber = (/(\d)/).test(lastItem)

      // remove
      if (eventType === 'remove') {
        if (amount.length > 1) {
          const amountWithouLastNumber = amountSplit.slice(0, -1).join('')
          if (lastItem.length > 1) {
            const lastNumber = lastItem.replace(/\s+/g, '').slice(0, -1)
            const formatedLastNumber = Number(lastNumber).toLocaleString('ru-RU')
            const combinedAmount = amountWithouLastNumber + formatedLastNumber
            this.setTrnFormAmount(combinedAmount)
          }
          else {
            this.setTrnFormAmount(amountWithouLastNumber)
          }
        }
        else {
          this.setTrnFormAmount('0')
        }
        return
      }

      // action
      if (eventType === 'action' && lastItem !== '0') {
        if (isLastItemNumber && isLastItemNumber) {
          this.setTrnFormAmount(`${amount}${value}`)
        }
        else {
          const amountWithoutOperator = amount.slice(0, -1)
          this.setTrnFormAmount(`${amountWithoutOperator}${value}`)
        }
        return
      }

      // number
      if (isValueNumber) {
        if (amount === '0') {
          this.setTrnFormAmount(value)
        }
        // usual number
        else if (isLastItemNumber) {
          if (lastItem.length < 15) {
            // first number
            if (amountSplit.length === 1) {
              const joinedAmount = amount.replace(/\s+/g, '') + value
              const formatedAmount = Number(joinedAmount).toLocaleString('ru-RU')
              this.setTrnFormAmount(formatedAmount)
            }
            // number with action
            else {
              const amountWithouLastNumber = amountSplit.slice(0, -1).join('')
              const lastNumber = lastItem.replace(/\s+/g, '') + value
              const formatedLastNumber = Number(lastNumber).toLocaleString('ru-RU')
              const combinedAmount = amountWithouLastNumber + formatedLastNumber
              this.setTrnFormAmount(combinedAmount)
            }
          }
        }
        // after action
        else if (value !== '0') {
          this.setTrnFormAmount(`${amount}${value}`)
        }
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
    },

    handleMath () {
      if (this.$store.state.trnForm.values.amountEvaluation) {
        const amount = Number(this.$store.state.trnForm.values.amountEvaluation).toLocaleString('ru-RU')
        this.$store.commit('trnForm/setTrnFormValues', {
          amount,
          amountEvaluation: null
        })
      }
    },

    handleClear () {
      this.setTrnFormAmount('0')
    },

    setTrnFormAmount (amount) {
      this.$store.commit('trnForm/setTrnFormValues', {
        amount,
        amountEvaluation: this.evaluateAmount(amount)
      })
    }
  }
}
</script>

<template lang="pug">
.trnFormCalculator
  .calcItem._act(@click="event => handlePress(event, 'action')")
    .calcItem__in +
  .calcItem._num(@click="event => handlePress(event, 'number')")
    .calcItem__in 7
  .calcItem._num(@click="event => handlePress(event, 'number')")
    .calcItem__in 8
  .calcItem._num(@click="event => handlePress(event, 'number')")
    .calcItem__in 9

  .calcItem._act(@click="event => handlePress(event, 'action')")
    .calcItem__in -
  .calcItem._num(@click="event => handlePress(event, 'number')")
    .calcItem__in 4
  .calcItem._num(@click="event => handlePress(event, 'number')")
    .calcItem__in 5
  .calcItem._num(@click="event => handlePress(event, 'number')")
    .calcItem__in 6

  .calcItem._act(@click="event => handlePress(event, 'action')")
    .calcItem__in *
  .calcItem._num(@click="event => handlePress(event, 'number')")
    .calcItem__in 1
  .calcItem._num(@click="event => handlePress(event, 'number')")
    .calcItem__in 2
  .calcItem._num(@click="event => handlePress(event, 'number')")
    .calcItem__in 3

  .calcItem._act(@click="event => handlePress(event, 'action')")
    .calcItem__in /
  .calcItem._clear(@click="handleClear")
    .calcItem__in C
  .calcItem._num(@click="event => handlePress(event, 'number')")
    .calcItem__in 0
  .calcItem._clear(@click="event => handlePress(event, 'remove')")
    .calcItem__in: .mdi.mdi-chevron-left

  .calcItem._sum(
    @click="amounIsNumber ? $emit('onFormSubmit') : handleMath()"
    :class="{ _expenses: $store.state.trnForm.values.amountType === 0, _incomes: $store.state.trnForm.values.amountType === 1 }"
  )
    .calcItem__in
      template(v-if="amounIsNumber")
        .mdi.mdi-check
      template(v-else)
        .mdi.mdi-equal
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/animations"
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/fonts"
@import "~assets/stylus/variables/media"

.trnFormCalculator
  display grid
  grid-template-columns repeat(5, minmax(10px, 1fr))
  grid-template-rows repeat(4, minmax(10px, 1fr))
  grid-column-gap 8px
  grid-row-gap 8px
  padding $m7

.calcItem
  display flex
  align-items center
  justify-content center
  font-secondary()
  anim()

  ~/._sum
    grid-column 5 / 6
    grid-row 1 / -1
    align-items stretch
    padding-left 4px
    color var(--c-font-1)

  &__in
    display flex
    align-items center
    justify-content center
    width 40px
    height 40px
    font-size 22px
    border-bottom 0
    border-right 0
    border-radius 50%

    @media $media-phone-normal
      padding $m8

    ~/._num &
      color var(--c-font-3)
      background var(--c-bg-3)

    ~/._act &
      color var(--c-font-4)

    ~/._clear &
      color var(--c-font-5)

    ~/._sum &
      width 100%
      height 100%
      font-size 40px
      background var(--c-blue-1)
      border-radius 6px

      ~/._expenses &
        background var(--c-expenses-1)

      ~/._incomes &
        background var(--c-incomes-1)

    &:active
      background var(--c-bg-3)
      transform scale(1.1)
</style>

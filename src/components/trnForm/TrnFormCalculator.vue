<script>
import mathjs from 'mathjs'

export default {
  computed: {
    amountType () {
      return this.$store.state.trnForm.values.amountType
    },

    amounIsNumber () {
      const amountString = this.$store.state.trnForm.values.amountArray.join('')
      const amount = String(amountString).replace(/\s/g, '')
      if (Number.isInteger(Number(amount))) {
        return true
      }
    }
  },

  methods: {
    onClear () {
      const amountArray = [0]
      const amount = 0
      this.$store.commit('setTrnFormValues', { amount, amountArray })
    },

    formatToAmountWithSpaces (value) {
      return Number(Math.abs(value)).toLocaleString('ru-RU')
    },

    handleMath () {
      function calc (number) {
        return mathjs.chain(number.replace(/\s/g, '')).eval().round().value
      }

      try {
        const amountString = this.$store.state.trnForm.values.amountArray.join('')
        const amountResult = calc(amountString)
        const amountSum = this.formatToAmountWithSpaces(amountResult)
        this.$store.commit('setTrnFormValues', {
          amount: Number(amountResult),
          amountArray: [amountSum]
        })
      } catch (e) {
        this.$notify({
          group: 'main',
          title: '😮',
          text: 'Check your amount'
        })
      }
    },

    handlePress (event, eventType) {
      const amountArray = this.$store.state.trnForm.values.amountArray
      let value = event.target.innerText
      if (eventType === 'number') value = Number(value)
      let newAmountArray = amountArray
      const lastIndex = newAmountArray.length - 1
      let lastValue = String(amountArray[lastIndex]).replace(/\s/g, '')
      let isLatValueNumber = Number.isInteger(Number(lastValue))
      if (isLatValueNumber) lastValue = Number(lastValue)

      if (lastValue === 0) {
        if (eventType === 'number' && value !== 0) {
          newAmountArray[lastIndex] = value
        }
        if (eventType === 'remove' && newAmountArray.length > 1) {
          newAmountArray = newAmountArray.slice(0, lastIndex)
        }
      } else {
        switch (eventType) {
          case 'number':
            if (isLatValueNumber) {
              newAmountArray[lastIndex] = this.formatToAmountWithSpaces(`${lastValue}${value}`)
            } else {
              if (value !== 0) {
                newAmountArray.push(value)
              }
            }
            break

          case 'action':
            if (isLatValueNumber && value !== 0) {
              newAmountArray.push(value)
            } else {
              newAmountArray[lastIndex] = value
            }
            break

          case 'remove':
            if (newAmountArray.length <= 1) {
              newAmountArray = [this.formatToAmountWithSpaces(`${String(lastValue).substring(0, String(lastValue).length - 1)}`)]
            } else {
              if (isLatValueNumber && lastValue >= 10) {
                newAmountArray[lastIndex] = this.formatToAmountWithSpaces(`${String(lastValue).substring(0, String(lastValue).length - 1)}`)
              } else {
                newAmountArray = newAmountArray.slice(0, lastIndex)
              }
            }
        }
      }
      if (newAmountArray.length === 1) {
        const amount = parseInt(String(newAmountArray[0]).replace(/\s/g, ''))
        this.$store.commit('setTrnFormValues', { amount })
      }
      this.$store.commit('setTrnFormValues', { amountArray: newAmountArray })
    }
  }
}
</script>

<template lang="pug">
.trnFormCalculator
  .trnFormCalculator__el._act(@click="event => handlePress(event, 'action')") +
  .trnFormCalculator__el._num(@click="event => handlePress(event, 'number')") 7
  .trnFormCalculator__el._num(@click="event => handlePress(event, 'number')") 8
  .trnFormCalculator__el._num(@click="event => handlePress(event, 'number')") 9

  .trnFormCalculator__el._act(@click="event => handlePress(event, 'action')") -
  .trnFormCalculator__el._num(@click="event => handlePress(event, 'number')") 4
  .trnFormCalculator__el._num(@click="event => handlePress(event, 'number')") 5
  .trnFormCalculator__el._num(@click="event => handlePress(event, 'number')") 6

  .trnFormCalculator__el._act(@click="event => handlePress(event, 'action')") *
  .trnFormCalculator__el._num(@click="event => handlePress(event, 'number')") 1
  .trnFormCalculator__el._num(@click="event => handlePress(event, 'number')") 2
  .trnFormCalculator__el._num(@click="event => handlePress(event, 'number')") 3

  .trnFormCalculator__el._act(@click="event => handlePress(event, 'action')") /
  .trnFormCalculator__el._act._clear(@click="onClear") C
  .trnFormCalculator__el._num(@click="event => handlePress(event, 'number')") 0
  .trnFormCalculator__el._act._clear(@click="event => handlePress(event, 'remove')"): .mdi.mdi-chevron-left

  .trnFormCalculator__el._sum(
    @click="amounIsNumber ? $emit('onFormSubmit') : handleMath()"
    :class="{ _expenses: amountType === 0, _incomes: amountType === 1 }"
  )
    template(v-if="amounIsNumber")
      .mdi.mdi-check
    template(v-else)
      .mdi.mdi-equal

  .trnFormCalculator__el._act(@click="$store.commit('closeTrnForm')")
    .mdi.mdi-arrow-collapse-down
</template>

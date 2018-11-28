<script>
import mathjs from 'mathjs'

import Button from '@/components/shared/button/Button'

export default {
  components: {
    Button
  },

  directives: {
    focus: {
      update: function (el) {
        el.focus()
      }
    }
  },

  data () {
    return {
      amountValue: null
    }
  },

  computed: {
    amountString () {
      return this.$store.state.trnForm.values.amountArray.join('')
    },

    amountType () {
      return this.$store.state.trnForm.values.amountType
    },

    amounIsNumber () {
      const amountString = String(this.amountValue).replace(/\s/g, '')
      if (Number(amountString)) return true
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
          if (this.$store.getters.walletsSortedIds.length > 1) {
            nextAmountType = 2
          }
          break
        case 2:
          nextAmountType = 0
          break
      }

      this.$store.commit('setTrnFormValues', {
        amountType: nextAmountType
      })
    },

    setAmountType (amountType) {
      this.$store.commit('setTrnFormValues', {
        amountType
      })
    },

    formatToAmountWithSpaces (value) {
      return Number(Math.abs(value)).toLocaleString('ru-RU')
    },

    handleMath () {
      function calc (number) {
        return mathjs.chain(number.replace(/\s/g, '')).eval().round().value
      }

      try {
        const amountResult = calc(this.amountValue)
        this.amountValue = this.formatToAmountWithSpaces(amountResult)
        this.$store.commit('setTrnFormValues', {
          amount: Number(amountResult)
        })
      } catch (e) {
        this.$notify({
          group: 'main',
          title: '😮',
          text: 'Check your amount'
        })
      }
    },

    handleSubmit () {
      const amountString = String(this.amountValue).replace(/\s/g, '')

      this.$store.commit('setTrnFormValues', {
        amount: Number(amountString)
      })
      this.$emit('onFormSubmit')
      this.amountValue = null
    }
  }
}
</script>

<template lang="pug">
.trnFormAmount(:class="className")
  //- pre {{ this.$store.state.trnForm.values.amountArray }}
  //- pre {{ amountString }}
  //- pre {{ amountValue }}
  //- mobile
  template(v-if="$store.state.ui.mobile")
    .trnFormAmount__in(@click="handleChangeAmountType")
      .trnFormAmount__type
        template(v-if="amountType === 0") Expense
        template(v-if="amountType === 1") Incomes
        template(v-if="amountType === 2 && $store.getters.walletsSortedIds.length > 1") Transfer

      .trnFormAmount__value {{ amountString }}

  //- pc
  template(v-if="$store.state.ui.pc")
    .amount-form.trnFormAmountPc
      .trnFormAmountPc__types
        .trnFormAmountPc__type._expenses(
          @click="() => setAmountType(0)"
          :class="{ _active: amountType === 0 }"
        ) Expenses
        .trnFormAmountPc__type._incomes(
          @click="() => setAmountType(1)"
          :class="{ _active: amountType === 1 }"
        ) Incomes
        .trnFormAmountPc__type(
          v-if="$store.getters.walletsSortedIds.length > 1"
          @click="() => setAmountType(2)"
          :class="{ _active: amountType === 2 }"
        ) Transfer

      .trnFormAmountPc__input
        input.trnFormAmountPc__input__value(
          placeholder="0"
          v-model="amountValue"
          v-focus)

    .action
      template(v-if="!amountValue")
        Button(
          className="_blue"
          title="Write amount"
          v-on:onClick="handleMath")
      template(v-else-if="amounIsNumber")
        Button(
          className="_blue"
          :title="$store.state.trnForm.values.amountType === 2 ? 'Create transfer' : 'Create transaction'"
          v-on:onClick="handleSubmit")
      template(v-else)
        Button(
          className="_blue"
          title="Calculate"
          v-on:onClick="handleMath")
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"

.action
  padding $m9

.amount-form
  background var(--c-bg-2)
  border-top 1px solid var(--c-bg-1)
  border-bottom 1px solid var(--c-bg-1)
</style>

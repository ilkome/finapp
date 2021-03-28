<script>
import Cleave from 'vue-cleave-component'

export default {
  components: {
    Cleave
  },

  data () {
    return {
      budgetName: '',
      budgetAmount: '',
      budgetTrnsIds: [],
      amountInputOptions: {
        numeral: true,
        numeralPositiveOnly: true,
        numeralDecimalScale: 0,
        delimiter: ' '
      }
    }
  },

  methods: {
    async handleCreateBudget () {
      const isFormValid = this.validateForm()
      if (isFormValid) {
        const values = {
          amount: this.budgetAmount,
          currency: this.$store.state.currencies.base,
          name: this.budgetName,
          trnsIds: this.budgetTrnsIds
        }

        await this.$store.dispatch('budgets/createBudget', values)
        this.budgetName = null
        this.budgetAmount = null
      }
    },

    validateForm () {
      if (!this.budgetName) {
        const budgetNameRef = this.$refs.budgetNameRef
        this.focusInputName(budgetNameRef)
        budgetNameRef.classList.remove('_error')
        setTimeout(() => { budgetNameRef.classList.add('_error') }, 10)
        return false
      }

      if (!this.budgetAmount) {
        const budgetAmountRef = this.$refs.budgetAmountRef
        this.focusInputName(budgetAmountRef)
        budgetAmountRef.classList.remove('_error')
        setTimeout(() => { budgetAmountRef.classList.add('_error') }, 10)
        return false
      }

      return true
    },

    focusInputName (ref) {
      ref.querySelector('.inputText__value').focus()
    },

    isSelectedTrn (trnId) {
      return this.budgetTrnsIds.includes(trnId)
    },

    handleSelectTrn (trnId) {
      if (this.budgetTrnsIds.includes(trnId)) {
        this.budgetTrnsIds = this.budgetTrnsIds.filter(item => item !== trnId)
      }
      else {
        this.budgetTrnsIds.push(trnId)
      }
    }
  }
}
</script>

<template lang="pug">
.form
  .form__title {{ $t('budgets.form.title') }}

  .form__group(ref="budgetNameRef")
    .inputText__label {{ $t('budgets.form.name') }}
    .inputText
      input.inputText__value(
        v-model="budgetName"
        :placeholder="`${$t('budgets.form.name')}...`"
        type="text"
      )

  .form__group(ref="budgetAmountRef")
    .inputText__label {{ $t('budgets.form.amount') }}
    .inputText
      cleave(
        v-model="budgetAmount"
        :placeholder="`${$t('budgets.form.amount')} ${$store.state.currencies.base}...`"
        class="inputText__value _number"
        :options="amountInputOptions")

  SharedButton(
    className="_blue _inline _text-center"
    :title="$t('budgets.form.button')"
    @onClick="handleCreateBudget")
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/fonts"

.form
  overflow hidden
  padding 25px 20px
  background var(--c-bg-3)
  border 1px solid var(--c-bg-4)

  &__title
    font-header-1()
    margin-bottom 30px

  &__group
    padding-bottom 30px
    &._error
      animation shake .5s linear

.inputText__value
  height 40px
  padding 0 16px
  font-size 16px
  background var(--c-bg-1)
  border 1px solid var(--c-bg-7)
  border-radius 3px

  &._number
    font-size 22px
    font-secondary()
    &::placeholder
      font-primary()
      font-size 16px

  &:focus
    border-color var(--c-bg-9)

.inputText__label
  border 0
  margin 0
  padding 0
  padding-bottom 10px
  font-size 11px

@keyframes shake
  8%, 41%
    transform translateX(-10px)
  25%, 58%
    transform translateX(10px)
  75%
    transform translateX(-5px)
  92%
    transform translateX(5px)
  0%, 100%
    transform translateX(0)
</style>

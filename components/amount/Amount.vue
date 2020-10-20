<script>
export default {
  props: {
    value: {
      type: Number,
      required: true
    },

    currency: {
      type: String,
      required: true
    },

    type: {
      type: Number,
      default: null
    },

    showBase: {
      type: Boolean,
      default: true
    },

    size: {
      type: String,
      default: null
    },

    vertical: {
      type: String,
      default: null
    }
  },

  computed: {
    className () {
      return {
        [`_${this.vertical}`]: this.vertical,
        _expenses: this.type === 0,
        _incomes: this.type === 1,
        [`_size_${this.size}`]: this.size
      }
    }
  },

  methods: {
    getCurrencySymbol (currency) {
      switch (currency) {
        case 'USD':
          return '$'
        case 'RUB':
          return '₽'
        case 'EUR':
          return '€'
        case 'IDR':
          return 'Rp'
        case 'THB':
          return '฿'
        default:
          return currency
      }
    },

    formatAmount (amount, fixedNumber = false) {
      // const number = Number.isInteger(amount) ? amount : 0
      const number = amount
      const fixed = fixedNumber || 2
      return Number(`${number.toFixed(fixed)}`).toLocaleString('ru-RU')
    },

    convertToBaseCurrency () {
      const baseValue = this.$store.getters['currencies/getAmountInBaseCurrency']({ amount: this.value, currency: this.currency })
      if (baseValue) {
        return this.formatAmount(baseValue, '0')
      }
    }
  }
}
</script>

<template lang="pug">
.amount(:class="className")
  .amountItem._original(:class="className")
    .amountItem__value {{ formatAmount(value) }}
    .amountItem__symbol {{ getCurrencySymbol(currency) }}

  template(v-if="showBase && (value !== 0) && ($store.state.currencies.base && currency !== $store.state.currencies.base)")
    .amountItem._base(:class="className")
      .amountItem__value {{ convertToBaseCurrency() }}
      .amountItem__symbol {{ getCurrencySymbol($store.state.currencies.base) }}
</template>

<style lang="stylus" scoped>

.amount
  color var(--c-font-base)

  &._incomes
    color var(--c-incomes-1)
  &._expenses
    color var(--c-expenses-1)

.amountItem
  display flex
  align-items flex-end
  justify-content flex-end

  &._left
    justify-content flex-start

  &._center
    justify-content center

  &._original
    font-size 16px

  &._base
    opacity .6
    padding-top 5px

  &__value
    font-size 15px
    font-weight bold
    font-secondary()

    ^[0]._base &
      font-size 12px

    ^[0]._size_md &
      font-size 16px
      font-weight 600

  &__symbol
    padding-bottom 0px
    padding-left 2px

    ~/._original &
      padding-bottom 1px
      font-size 12px

    ~/._base &
      font-size 10px

    ~/._size_lg &
      padding-bottom 3px

.amount._size_lg
  .amountItem__value
    font-size 22px
    font-weight 500

  .amountItem__symbol
    font-size 16px

.amount._size_md
  .amountItem__symbol
    font-size 12px
</style>

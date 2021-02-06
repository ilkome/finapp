<script>
import currency from 'currency.js'

const baseAmountFormat = (value, separator) => currency(value, { symbol: '', precision: 0, pattern: '#', separator }).format()

export default {
  name: 'Amount',

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
    },

    isShowPrefix: {
      type: Boolean,
      default: false
    },

    isColorize: {
      type: Boolean,
      default: true
    },

    isAltColor: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    className () {
      return {
        _altColor: this.isAltColor,
        _expenses: this.isColorize && this.type === 0,
        _incomes: this.isColorize && this.type === 1,
        [`_${this.vertical}`]: this.vertical,
        [`_size_${this.size}`]: this.size
      }
    },

    amountInBaseCurrency () {
      const baseValue = this.$store.getters['currencies/getAmountInBaseCurrency']({
        amount: this.value,
        currency: this.currency
      })

      if (baseValue) {
        return this.formatAmount(baseValue)
      }
      return null
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

    formatAmount (amount) {
      return baseAmountFormat(amount, ' ')
    }
  }
}
</script>

<template lang="pug">
.amount(:class="className")
  .amountItem._original(:class="className")
    .amountItem__prefix(v-if="isShowPrefix && value !== 0") {{ type === 0 ? '-' : '+' }}
    .amountItem__value {{ formatAmount(value) }}
    .amountItem__symbol {{ getCurrencySymbol(currency) }}

  template(v-if="showBase && (value !== 0) && (currency !== $store.state.currencies.base)")
    .amountItem._base(:class="className")
      .amountItem__prefix(v-if="isShowPrefix && value !== 0") {{ type === 0 ? '-' : '+' }}
      .amountItem__value {{ amountInBaseCurrency }}
      .amountItem__symbol {{ getCurrencySymbol($store.state.currencies.base) }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.amount
  color var(--c-font-base)
  typo-money()

  &._altColor
    /.light-mode &
      color var(--c-font-1)

  &._incomes
    color var(--c-incomes-1)

  &._expenses
    color var(--c-expenses-1)

  @media $media-laptop
    font-size 16px

  &._big
    font-size 20px
    font-weight 600

  &._small
    font-size 14px
    font-weight 600

  &__wrap
    display flex
    flex-flow row nowrap
    align-items flex-end
    justify-content flex-end

    ^[0]._center &
      justify-content center

  &__price
    &:first-child
      margin-right $m3

    &:last-child
      margin-left $m3

  &__symbol
    font-primary()
    font-size 14px
    font-weight normal

    ^[0]._small &
      font-size 11px

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
    padding-top 0px

  &__prefix
    align-self center
    padding-right $m2
    font-weight 400

    ~/._size_xl &
      padding-right $m4
      font-size 26px

  &__value
    font-secondary()
    font-size 14px
    font-weight 400

    ~/._base &
      font-size 12px

    ~/._size_md &
      font-size 16px
      font-weight 600

    ~/._size_xl &
      font-size 36px
      font-weight 500

    ~/._size_xl._base &
      padding-top $m6
      font-size 18px

  &__symbol
    padding-bottom 0px
    padding-left 2px
    font-weight 400

    ~/._original &
      padding-bottom 1px
      font-size 12px

    ~/._base &
      font-size 10px

    ~/._size_lg &
      padding-bottom 3px

    ~/._size_xl &
      padding-bottom 4px
      font-size 18px
      font-weight 300

    ~/._size_xl._base &
      padding-bottom 0
      font-size 14px

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

<script>
export default {
  props: {
    currency: {
      type: String,
      required: true
    },
    value: {
      type: Number,
      required: true
    },

    alwaysShowSymbol: {
      type: Boolean,
      default: false
    },
    big: {
      type: Boolean,
      default: false
    },
    center: {
      type: Boolean,
      default: false
    },
    left: {
      type: Boolean,
      default: false
    },
    small: {
      type: Boolean,
      default: false
    },
    type: {
      type: [Number, Boolean],
      default: false
    }
  },

  computed: {
    amountValue () {
      return this.formatAmount(this.value)
    },

    amountSymbol () {
      return this.getCurrencySymbol(this.currency)
    },

    amountValueBaseCurrency () {
      const currencies = this.$store.state.currencies.items
      const baseValue = this.value / currencies[this.currency]
      return this.formatAmount(baseValue)
    },

    amountSymbolBaseCurrency () {
      return this.getCurrencySymbol(this.$store.state.currencies.base)
    },

    className () {
      return {
        _big: this.big,
        _center: this.center,
        _left: this.left,
        _small: this.small,
        _incomes: this.type === 1,
        _expenses: this.type === 0
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

    formatAmount (amount) {
      const fixed = this.currency === 'RUB' ? 0 : 2
      return Number(`${amount.toFixed(fixed)}`).toLocaleString('ru-RU')
    }
  }
}
</script>

<template lang="pug">
.amount(:class="className")
  //- empty
  template(v-if="value === 0")
    .amount__wrap
      .amount__price 0
      .amount__symbol(v-if="alwaysShowSymbol") {{ amountSymbol }}

  //- value
  template(v-else)
    .amount__wrap
      .amount__price {{ amountValue }}
      .amount__symbol {{ amountSymbol }}

    //- convert to base currency
    template(v-if="$store.state.currencies.base !== currency")
      .amount__wrap._small
        .amount__price._small {{ amountValueBaseCurrency }}
        .amount__symbol._small {{ amountSymbolBaseCurrency }}
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.amount
  typo-money()

  @media $media-laptop
    font-size 16px

  &__wrap
    display flex
    flex-flow row nowrap
    justify-content flex-end
    align-items flex-end

    &._small
      margin-top $m3

    // ^[0]._center &
    //   justify-content center

    // ^[0]._left &
    //   justify-content flex-start

  &._expenses
    color var(--c-expenses-1)

  &._incomes
    color var(--c-incomes-1)

  &__price
    &._small
      font-size 14px
      color var(--c-font-4)

  &__symbol
    font-primary()
    font-size 14px
    font-weight normal

    &._small
      font-size 12px
</style>

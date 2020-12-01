<script>
export default {
  name: 'SummaryRowItem',

  props: {
    name: {
      type: String,
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    type: {
      type: Number,
      required: true
    }
  },

  computed: {
    className () {
      return {
        _expenses: this.type === 0,
        _incomes: this.type === 1
      }
    }
  }
}
</script>

<template lang="pug">
.summaryRowItem(:class="className")
  .summaryRowItem__title {{ name }}
  .summaryRowItem__amount
    Amount(
      :currency="$store.state.currencies.base"
      :type="type"
      :value="amount || 0"
      size="md"
      vertical="left"
    )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.summaryRowItem
  flex 1 0 0
  position relative
  display flex
  justify-content center
  flex-flow column
  // padding-right 32px
  // text-align center

  &__title
    padding-bottom $m5
    color var(--c-font-4)
    font-size 12px
</style>

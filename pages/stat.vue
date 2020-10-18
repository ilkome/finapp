<script>
export default {
  name: 'StatPage',

  data () {
    return {
      visibleContextMenu: false,

      selectedPeriodAmount: {
        label: '',
        incomes: '',
        expenses: ''
      },

      periods: [{
        slug: 'day',
        name: this.$lang.dates.day.simple
      }, {
        slug: 'week',
        name: this.$lang.dates.week.simple
      }, {
        slug: 'month',
        name: this.$lang.dates.month.simple
      }, {
        slug: 'year',
        name: this.$lang.dates.year.simple
      }]
    }
  },

  computed: {
    stat () {
      return this.$store.getters['stat/statCurrentPeriod']
    },

    periodName () {
      return this.$store.state.filter.period
    }
  },

  mounted () {
  },

  methods: {
    changePeriod (period) {
      this.$store.dispatch('filter/setPeriod', period)
    }
  }
}
</script>

<template lang="pug">
LayoutMobile2
  template(#content)


  template(#modals)
    CategoryModal
    CurrencyModal
    TrnForm
    TrnModal
    WalletModal
    CategoryStatModal
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables"


</style>

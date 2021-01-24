<script>
export default {
  name: 'DateFormated',

  props: {
    date: {
      type: Number,
      required: true
    },

    periodName: {
      type: String,
      required: true
    }
  },

  computed: {
    formatedDate () {
      const today = this.$day()
      const filterDate = this.$day(this.date)
      const filterPeriod = this.periodName
      let format = 'MMMM'

      switch (filterPeriod) {
        case 'day':
          if (today.isSame(filterDate, 'year')) {
            format = 'DD MMMM'
          }
          else {
            format = 'DD MMMM YYYY'
          }
          break

        case 'week':
          const startDate = this.$day(filterDate).startOf('week')
          const endDate = this.$day(filterDate).endOf('week')

          // this week
          if (today.isSame(filterDate, 'week')) {
            return this.$t('dates.week.current')
          }
          // last week
          else if (today.subtract(1, filterPeriod).isSame(filterDate, 'week')) {
            return this.$t('dates.week.last')
          }
          // same month in week
          else if (this.$day(startDate).isSame(endDate, 'month')) {
            return `${this.$day(startDate).format('D')}-${this.$day(endDate).format('D MMMM')}`
          }
          else {
            return `${this.$day(startDate).format('D MMMM')} - ${this.$day(endDate).format('D MMMM')}`
          }

        case 'month':
          if (today.isSame(filterDate, 'year')) {
            format = 'MMMM'
            break
          }
          format = 'MMMM YYYY'
          break

        case 'year':
          format = 'YYYY'
          break
      }

      return this.$day(filterDate).format(format)
    }
  }
}
</script>

<template lang="pug">
.date
  template(v-if="$store.state.filter.period === 'all'") {{ $t('dates.all.simple') }}
  template(v-else) {{ formatedDate }}
</template>

<style lang="stylus" scoped>
.date
  display flex
  align-items center

  &:first-letter
    text-transform uppercase
</style>

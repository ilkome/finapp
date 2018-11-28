<script>
import moment from 'moment'

export default {
  computed: {
    formatedDate () {
      const today = moment()
      const filterDate = this.$store.state.filter.date
      const filterPeriod = this.$store.state.filter.period
      let format = 'MMMM'

      switch (filterPeriod) {
        case 'day':
          if (today.isSame(filterDate, 'day')) {
            return 'Today'
          } else if (today.subtract(1, filterPeriod).isSame(filterDate, 'day')) {
            return 'Yesterday'
          }
          format = 'DD MMMM YYYY'
          break

        case 'week':
          if (today.isSame(filterDate, 'week')) {
            return 'This week'
          } else if (today.subtract(1, filterPeriod).isSame(filterDate, 'week')) {
            return 'Last week'
          }
          const date = moment(filterDate)
          const startDate = date.startOf('week').format('DD.MM.YY')
          const endDate = date.endOf('week').format('DD.MM.YY')
          return `${startDate} - ${endDate}`

        case 'month':
          if (today.isSame(filterDate, 'month')) {
            return 'This month'
          } else if (today.subtract(1, filterPeriod).isSame(filterDate, 'month')) {
            return 'Last month'
          }
          format = 'MMMM YYYY'
          break

        case 'year':
          format = 'YYYY'
          break
      }

      return moment(filterDate).format(format)
    }
  }
}
</script>

<template lang="pug">
.date
  template(v-if="$store.state.filter.period === 'all'") All data
  template(v-else) {{ formatedDate }}
</template>

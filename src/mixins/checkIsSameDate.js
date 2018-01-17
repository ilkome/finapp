import moment from 'moment'

export default {
  methods: {
    checkIsSameDate(date) {
      if (this.$store.state.dashboard.timePeriod === 'year') {
        return moment(date).isSame(this.trnsDate.start, 'month')
      }
      // TODO move this.trnsDate.start to store. Used by DashboardPage, ChartYears
      return moment(date).isSame(this.trnsDate.start, this.$store.state.dashboard.timePeriod)
    }
  }
}

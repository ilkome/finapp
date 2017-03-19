<template lang="pug">
div
  h1.panelTitle
    | Итоги за&nbsp;
    a.link(@click.prevent="changeDuration()") {{ duration }} дней

  ChartByDate(:date="date", :duration="duration")
  ChartByCategory
</template>


<script>
import moment from 'moment'
import formatMoney from '../../mixins/money'
import ChartByDate from '../chart/ChartByDate.vue'
import ChartByCategory from '../chart/ChartByCategory.vue'


export default {
  mixins: [formatMoney],

  data() {
    const duration = 10

    return {
      date: {
        start: moment().subtract(duration, 'days')
      },
      duration
    }
  },

  methods: {
    changeDuration() {
      switch (this.duration) {
        case 3:
          this.date.start = moment().subtract(7, 'days')
          this.duration = 7
          break
        case 7:
          this.date.start = moment().subtract(14, 'days')
          this.duration = 14
          break
        case 14:
          this.date.start = moment().subtract(30, 'days')
          this.duration = 30
          break
        case 30:
          this.date.start = moment().subtract(3, 'days')
          this.duration = 3
          break
        default:
          this.date.start = moment().subtract(7, 'days')
          this.duration = 7
      }
    }
  },


  components: { ChartByDate, ChartByCategory }
}
</script>

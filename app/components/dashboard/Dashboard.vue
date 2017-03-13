<template lang="pug">
div
  h1.panelTitle
    | Итоги за&nbsp;
    a.link(@click.prevent="changeDuration()") {{ duration }} дней

  ChartByDate(:date="date")
</template>


<script>
import moment from 'moment'
import formatMoney from '../../mixins/money'
import ChartByDate from '../chart/ChartByDate.vue'
import ChartPie from '../chart/ChartPie.vue'

export default {
  mixins: [formatMoney],

  data() {
    return {
      date: {
        start: moment().subtract(7, 'days')
      },
      duration: 7
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
          this.date.start = moment().subtract(3, 'days')
          this.duration = 3
          break
        default:
          this.date.start = moment().subtract(7, 'days')
          this.duration = 7
      }
    },

    showYear() {
      this.date = {
        start: '1.01.16',
        add: [1, 'year']
      }
    },
    showMonth() {
      this.date = {
        start: '1.01.17',
        add: [1, 'month']
      }
    }
  },


  components: { ChartByDate, ChartPie }
}
</script>

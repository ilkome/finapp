<template lang="pug">
div
  h1.panelTitle Итоги за последние 7 дней

  .accountDetails._small
    .accountContentItem
      .accountContentItemLabel Приход
      .accountContentItemTotal.income {{formatMoney(380)}}
    .accountContentItem
      .accountContentItemLabel Рассход
      .accountContentItemTotal.expense {{formatMoney(113233)}}
    .accountContentItem
      .accountContentItemLabel Итого
      .accountContentItemTotal
        .accountContentItemTotalIn {{formatMoney(22333)}}

  ChartByDate(:date="date")
  a(@click="showYear()") Показать год
  a(@click="showMonth()") Показать месяц

  ChartByCategory
</template>


<script>
import formatMoney from '../../mixins/money'
import ChartByCategory from '../chart/ChartByCategory.vue'
import ChartByDate from '../chart/ChartByDate.vue'

export default {
  mixins: [formatMoney],

  data() {
    return {
      date: {
        start: '1.02.17',
        // add: [2, 'month']
        // end: '31.01.17'
      }
    }
  },

  methods: {
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


  components: { ChartByCategory, ChartByDate }
}
</script>

<template lang="pug">
.panelCol
  template(v-if="!isEmpty(expenses)")
    .panel
      h2.title Рассходы
      .panelChart
        Chart(:data="expenses")

  template(v-if="!isEmpty(incomes)")
    .panel
      h2.title Поступления
      .panelChart
        Chart(:data="incomes")
</template>


<script>
import isEmpty from 'lodash/isEmpty'
import formatMoney from '../../mixins/formatMoney'
import formatDataForCharts from '../../mixins/formatDataForCharts'
import Chart from '../chart/Chart.vue'

export default {
  mixins: [formatMoney, formatDataForCharts],

  props: {
    expenses: {
      type: Object
    },
    incomes: {
      type: Object
    }
  },

  methods: {
    isEmpty(obj) {
      return isEmpty(obj)
    }
  },

  components: { Chart }
}
</script>

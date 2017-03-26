<template lang="pug">
div
  h1.title
    | Итого за:&nbsp;
    .color {{ duration }} дней

  .table
    .table__cell
      SummaryShort(
        :duration="duration",
        :expenses="expensesTotal",
        :incomes="incomesTotal"
      )
    .table__cell
      .panel
        h2.title Количество дней
        .panel__content
          a.btn(@click.prevent="setDuration(1)", :class="{_active: duration === 1}") 1
          a.btn(@click.prevent="setDuration(3)", :class="{_active: duration === 3}") 3
          a.btn(@click.prevent="setDuration(5)", :class="{_active: duration === 5}") 5
          a.btn(@click.prevent="setDuration(7)", :class="{_active: duration === 7}") 7
          a.btn(@click.prevent="setDuration(10)", :class="{_active: duration === 10}") 10
          a.btn(@click.prevent="setDuration(14)", :class="{_active: duration === 14}") 14
          a.btn(@click.prevent="setDuration(30)", :class="{_active: duration === 30}") 30

          //- .input
          //-   input.input__field(
          //-     ref="input",
          //-     :value="duration",
          //-     v-on:input="updateValue($event.target.value)",
          //-     placeholder="Укажите количество дней" type="text"
          //-   )
          //-   .input__label Количество дней

  SummaryCharts(
    :expenses="expensesDataChart",
    :incomes="incomesDataChart"
  )

  .table
    .table__cell
      .accountTrns.trnList
        h2.title._minus Транзакции
        template(v-for="(trn, index) in trnsList.slice(0, 10)")
          .trnsDay
            h3(v-if="!isSameDay(index)") {{ trn.date | date}}
            TrnItem(:trn="trn", :key="trn.id")

    .table__cell
      TrnCreate
</template>


<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import formatMoney from '../../mixins/formatMoney'
import formatDataForCharts from '../../mixins/formatDataForCharts'
import SummaryShort from '../summary/SummaryShort.vue'
import SummaryCharts from '../summary/SummaryCharts.vue'
import TrnItem from '../trn/TrnItem.vue'
import TrnCreate from '../trn/TrnCreate.vue'
import Chart from '../chart/Chart.vue'

export default {
  mixins: [formatMoney, formatDataForCharts],

  data() {
    const duration = 10

    return {
      date: {
        start: moment().subtract(duration, 'days')
      },
      duration
    }
  },

  computed: {
    ...mapGetters(['trns']),

    dateStart() {
      return moment(this.date.start, 'DD.MM.YY').startOf('day').valueOf()
    },

    dateEnd() {
      let dateEnd
      if (this.date.add) {
        dateEnd = moment(this.date.start, 'DD.MM.YY').add(this.date.add[0], this.date.add[1]).valueOf()
      } else if (this.date.end) {
        dateEnd = moment(this.date.end, 'DD.MM.YY').endOf('day').valueOf()
      } else {
        dateEnd = moment().endOf('day').valueOf()
      }
      return dateEnd
    },

    trnsList() {
      return this.trns.filter(trn =>
        trn.categoryId !== 62 && // disable category 'Перевод'
        moment(trn.date) >= this.dateStart &&
        moment(trn.date) <= this.dateEnd
      )
    },

    expensesTrns() {
      return this.trnsList.filter(trn => trn.type === 0)
    },

    expensesTotal() {
      return this.countTotalTrns(this.expensesTrns)
    },

    expensesDataChart() {
      if (this.expensesTrns.length > 0) {
        const data = this.getCategoriesWithTotal(this.expensesTrns)
        return this.formatDataForChart(data)
      }
      return {}
    },

    incomesTrns() {
      return this.trnsList.filter(trn => trn.type === 1)
    },

    incomesTotal() {
      return this.countTotalTrns(this.incomesTrns)
    },

    incomesDataChart() {
      if (this.incomesTrns.length > 0) {
        const data = this.getCategoriesWithTotal(this.incomesTrns)
        return this.formatDataForChart(data)
      }
      return {}
    },

    pieDataChart() {
      return this.formatDataForPieChart(this.expensesTotal, this.incomesTotal)
    }
  },

  methods: {
    updateValue(value) {
      let formattedValue = +value.trim()
      formattedValue = formattedValue < 0 ? 1 : formattedValue

      this.duration = formattedValue <= 0 ? 1 : formattedValue
      this.date.start = moment().subtract(this.duration, 'days')
      if (formattedValue !== value) {
        this.$refs.input.value = formattedValue
      }
    },
    setDuration(duration) {
      console.log(duration)
      this.duration = +duration
      this.date.start = moment().subtract(+duration, 'days')
    },
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


  components: { SummaryShort, SummaryCharts, TrnItem, TrnCreate, Chart }
}
</script>

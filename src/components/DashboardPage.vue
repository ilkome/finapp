<template lang="pug">
.content
  .module._fixHeight
    .gridTable._SummaryPeriodHorizontal
        //- Statistic
        //------------------------------------------------
        .gridTable__item
          h3.title._mbs
            .title__calendar(@click="openPopupCalendar($event)")
              .title__calendar__name
                .title__calendar__name__icon.mdi.mdi-calendar-multiple
                template(v-if="formatDate(startDate) === formatDate(endDate)")
                  template(v-if="formatDate(startDate) === formatDate(today)") Today
                  template(v-else) {{ formatDate(startDate) }}
                template(v-else) {{ formatDate(startDate) }} - {{ formatDate(endDate) }}
                sup.sup._visible
                  template(v-if="duration !== 1") {{ duration }} days

            transition(name="fade2")
              .calendar-dropdown(
                :style="{'left':calendar.left+'px','top':calendar.top+'px'}",
                v-if="calendar.show"
              )
                div.hey
                  .date__period
                    .date__item Today
                    .date__item Yeasterday
                  .date__period
                    .date__item(
                      :class="{_active: duration === 10}"
                      @click.prevent="setDuration(10)"
                    ) Last 10 days
                    .date__item(
                      :class="{_active: duration === 30}"
                      @click.prevent="setDuration(30)"
                    ) Last 30 days
                    .date__item(
                      :class="{_active: duration === 365}"
                      @click.prevent="setDuration(365)"
                    ) Last year
                  .date__period
                    .date__item This Week
                    .date__item This Month
                    .date__item This Year
                calendar(
                  :range="calendar.range",
                  :zero="calendar.zero",
                  :value="calendar.value"
                  @select="selectCalendarDates"
                )

          template(v-if="(incomesCategoriesData.length || expensesCategoriesData.length) > 0")
            .summaryShort._pb
              .summaryShort__item
                .summaryShort__item__icon._incomes
                .summaryShort__item__label Incomes
                .summaryShort__item__total.incomes {{ formatMoney(summary.incomes) }}
              .summaryShort__item
                .summaryShort__item__icon._expenses
                .summaryShort__item__label Expenses
                .summaryShort__item__total.expenses {{ formatMoney(summary.expenses) }}
              .summaryShort__item
                .summaryShort__item__icon._total
                .summaryShort__item__label Total
                .summaryShort__item__total.sum {{ formatMoney(summary.total) }}

          template(v-else)
            .summaryShort._pb
              .summaryShort__empty No trns for this period.

          //- Average
          //------------------------------------------------
          h3.title._mbs
            | Average&nbsp;
            sup.sup {{ avDays }} days
          .summaryShort
            .summaryShort__item
              .summaryShort__item__icon._incomes
              .summaryShort__item__label Incomes
              .summaryShort__item__total.incomes {{ formatMoney(avSummary.incomes) }}
            .summaryShort__item
              .summaryShort__item__icon._expenses
              .summaryShort__item__label Expenses
              .summaryShort__item__total.expenses {{ formatMoney(avSummary.expenses) }}
            .summaryShort__item
              .summaryShort__item__icon._total
              .summaryShort__item__label Total
              .summaryShort__item__total.sum {{ formatMoney(avSummary.total) }}

        //- Previous days
        //------------------------------------------------
        .gridTable__item
          h3.title._mbs Previous days

          .itemStatLine(
            v-for="(period, index) in periodsData",
            @click.prevent="showSelectedPeriodStat(index)",
            :class="{ _active: selectedPeriodIndex === index }"
          )
            .itemStatLine__in
              .itemStatLine__content
                .itemStatLine__text
                  .itemStatLine__name {{ period.date }}
                  .itemStatLine__price.incomes {{ formatMoney(period.incomes)}}
                  .itemStatLine__price.expenses  {{ formatMoney(period.expenses) }}
                  .itemStatLine__price.sum {{ formatMoney(period.incomes - period.expenses) }}
                .itemStatLine__graph
                  template(v-if="period.incomes > 0")
                    .itemStatLine__graph__in._income(:style="getPeriodGraphWidth(period.incomes)")
                  template(v-if="period.expenses > 0")
                    .itemStatLine__graph__in._expense(:style="getPeriodGraphWidth(period.expenses)")
  //- Tabs
  //------------------------------------------------
  template(v-if="(incomesCategoriesData.length || expensesCategoriesData.length) > 0")
    .tabs
      a(@click="changeTab('statistic')", :class="{_active: showedTab === 'statistic'}") Statistic
      a(@click="changeTab('trns')", :class="{_active: showedTab === 'trns'}") History


    .module._bg(v-show="showedTab === 'statistic'")
      .gridTable
        //- Expenses
        //------------------------------------------------
        .gridTable__item(v-if="expensesCategoriesData.length > 0")
          h1.title.expenses._wide._mbm Expenses
          .summaryShort._pbs
            .summaryShort__item
              .summaryShort__item__icon._expenses
              .summaryShort__item__label Total
              .summaryShort__item__total.sum {{ formatMoney(summary.expenses) }}
            .summaryShort__item(v-if="this.duration > 1")
              .summaryShort__item__icon._month
              .summaryShort__item__label Day average
              .summaryShort__item__total.sum {{ formatMoney(summary.expenses / this.duration) }}

          .trns
            template(v-for="itemStat in expensesCategoriesData")
              .itemStat._link._clear(:class="{_opened: showedTrnsCategoryId.indexOf(itemStat.id) !== -1}")
                .itemStat__in(@click.prevent.stop="toogleShowTrnsInCategory(itemStat.id)")
                  router-link.itemStat__icon(
                    :to="`/categories/${itemStat.id}`",
                    title="Go to category"
                  )
                    .icon._link(:style="`background: ${itemStat.color}`")
                      div(:class="itemStat.icon")
                  .itemStat__content
                    .itemStat__text
                      .itemStat__name {{ itemStat.name }}
                      .itemStat__price.sum {{ formatMoney(itemStat.total) }}
                    .itemStat__graph
                      .itemStat__graph__in._expense(:style="getCategoryGraphWidth(itemStat.total, expensesCategoriesData)")

                template(v-if="showedTrnsCategoryId.indexOf(itemStat.id) !== -1")
                  .itemStat__trns
                    TrnItem(
                      v-for="trn in itemStat.trns",
                      :trn="trn",
                      :key="trn.id",
                      view="small"
                    )

        //- Incomes
        //------------------------------------------------
        .gridTable__item(v-if="incomesCategoriesData.length > 0")
          h1.title.incomes._wide._mbm Incomes
          .summaryShort._pbs
            .summaryShort__item
              .summaryShort__item__icon._incomes
              .summaryShort__item__label Total
              .summaryShort__item__total.sum {{ formatMoney(summary.incomes) }}
            .summaryShort__item
              .summaryShort__item__icon._month
              .summaryShort__item__label Day average
              .summaryShort__item__total.sum {{ formatMoney(summary.incomes / this.duration) }}

          .trns
            template(v-for="itemStat in incomesCategoriesData")
              .itemStat._link(:class="{_opened: showedTrnsCategoryId.indexOf(itemStat.id) !== -1}")
                .itemStat__in(@click.prevent="toogleShowTrnsInCategory(itemStat.id)")
                  router-link.itemStat__icon(
                    :to="`/categories/${itemStat.id}`",
                    title="Go to category"
                  )
                    .icon(:style="`background: ${itemStat.color}`")
                      div(:class="itemStat.icon")
                  .itemStat__content
                    .itemStat__text
                      .itemStat__name {{ itemStat.name }}
                      .itemStat__price.sum {{ formatMoney(itemStat.total) }}
                    .itemStat__graph
                      .itemStat__graph__in._income(:style="getCategoryGraphWidth(itemStat.total, incomesCategoriesData)")

                template(v-if="showedTrnsCategoryId.indexOf(itemStat.id) !== -1")
                  .itemStat__trns
                    TrnItem(
                      v-for="trn in itemStat.trns",
                      :trn="trn",
                      :key="trn.id",
                      view="small"
                    )

    //- Trns history
    //------------------------------------------------
    .module._bg(v-show="showedTab === 'trns'")
      h1.title._wide._trns Trns history
      TrnsList(:trns="trnsList.slice(0, 100)")

</template>


<script>
import { mapGetters } from 'vuex'
import calendar from './calendar/calendar.vue'
import moment from 'moment'
import uniqBy from 'lodash/uniqBy'
import orderBy from 'lodash/orderBy'
import formatMoney from '../mixins/formatMoney'
import formatDate from '../mixins/formatDate'
import TrnsList from './TrnsList.vue'
import TrnItem from './TrnItem.vue'

export default {
  mixins: [formatDate, formatMoney],
  components: { TrnsList, TrnItem, calendar },

  data() {
    return {
      showedTab: 'statistic',
      days: [1, 5, 10, 7, 14, 30, 999],
      selectedPeriodIndex: 0,
      numberOfPeriods: 3,
      showedTrnsCategoryId: [],
      maxDate: 'today',
      today: moment(),
      avDays: 180,
      startDate: '',
      endDate: '',
      periodsStartDate: '',
      periodsEndDate: '',
      calendar: '',
      showedDurationDropdown: false
    }
  },

  beforeMount() {
    const startDate = moment().subtract(this.$store.state.filter.duration - 1, 'days')
    const endDay = moment()

    this.startDate = startDate
    this.endDate = endDay
    this.periodsStartDate = startDate
    this.periodsEndDate = endDay
    this.calendar = {
      show: false,
      range: true,
      zero: true,
      value: [
        startDate.format('Y.M.D').split('.'),
        endDay.format('Y.M.D').split('.')
      ]
    }

    document.addEventListener('keyup', (event) => {
      if (event.keyCode === 27) { // escape key
        console.log('document.addEventListener: keyup')
        this.calendar.show = false
        this.showedDurationDropdown = false
      }
    })
  },

  computed: {
    ...mapGetters(['categories', 'getTrns']),

    duration() {
      return this.$store.state.filter.duration
    },

    trnsList() {
      return this.getTrns(this.startDate, this.endDate)
    },

    incomesTrns() {
      return this.trnsList.filter(t => t.type === 1)
    },

    expensesTrns() {
      return this.trnsList.filter(t => t.type === 0)
    },

    incomesCategoriesData() {
      return this.formatTrnsForStat(this.incomesTrns)
    },

    expensesCategoriesData() {
      return this.formatTrnsForStat(this.expensesTrns)
    },

    summary() {
      const incomes = this.countSum(this.incomesTrns)
      const expenses = this.countSum(this.expensesTrns)
      const total = incomes - expenses

      return {
        incomes,
        expenses,
        total
      }
    },

    avSummary() {
      const yearTrns = this.getTrns(moment().subtract(6, 'months'), moment())
      const avStartDate = moment(yearTrns[0].date)
      const avEndDate = moment(yearTrns[yearTrns.length - 1].date)
      this.avDays = avStartDate.diff(avEndDate, 'days') + 1

      const avIncomes = yearTrns
        .filter(t => t.type === 1)
        .reduce((sum, current) => sum + current.amountRub, 0) / this.avDays * this.duration
      const avExpenses = yearTrns
        .filter(t => t.type === 0)
        .reduce((sum, current) => sum + current.amountRub, 0) / this.avDays * this.duration
      const total = avIncomes - avExpenses

      return {
        incomes: avIncomes,
        expenses: avExpenses,
        total
      }
    },

    periodsData() {
      const data = []

      for (let period = 1; period <= this.numberOfPeriods; period++) {
        const periodDuration = this.duration * period - this.duration
        const periodStartDate = moment(this.periodsStartDate).subtract(periodDuration, 'days')
        const periodEndDate = moment(this.periodsEndDate).subtract(periodDuration, 'days')

        let periodDate
        moment(periodStartDate).format('D.M.Y') === moment(periodEndDate).format('D.M.Y')
          ? periodDate = moment(periodStartDate).format('D MMM')
          : periodDate = `${moment(periodStartDate).format('D MMM')} - ${moment(periodEndDate).format('D MMM')}`

        const periodTrns = this.getTrns(periodStartDate, periodEndDate)
        const periodIncomes = periodTrns
          .filter(t => t.type === 1)
          .reduce((sum, current) => sum + current.amountRub, 0)
        const periodExpenses = periodTrns
          .filter(t => t.type === 0)
          .reduce((sum, current) => sum + current.amountRub, 0)
        const periodTotal = periodIncomes - periodExpenses

        data.push({
          period,
          date: periodDate,
          incomes: periodIncomes,
          expenses: periodExpenses,
          total: periodTotal
        })
      }

      return data
    }
  },

  methods: {
    selectCalendarDates(startDate, endDate) {
      this.startDate = moment(startDate.join('.'), 'Y.M.D')
      this.endDate = moment(endDate.join('.'), 'Y.M.D')
      this.periodsStartDate = this.startDate
      this.periodsEndDate = this.endDate

      this.calendar.show = false
      this.calendar.value = [startDate, endDate]

      this.selectedPeriodIndex = 0
      const duration = this.endDate.diff(this.startDate, 'days') + 1
      this.$store.commit('setDuration', duration)
    },

    toogleDurationPop() {
      this.calendar.show = false
      this.showedDurationDropdown = !this.showedDurationDropdown
    },

    openPopupCalendar(event) {
      this.showedDurationDropdown = false
      this.calendar.show = !this.calendar.show
      this.calendar.left = event.target.offsetLeft - 5
      this.calendar.top = event.target.offsetTop + 45
    },

    showSelectedPeriodStat(index) {
      if (this.selectedPeriodIndex === index) return

      this.showedTrnsCategoryId = []
      this.selectedPeriodIndex = index

      const startDate = moment(this.periodsStartDate).subtract(this.duration * index, 'days')
      const endDate = moment(this.periodsEndDate).subtract(this.duration * index, 'days')

      this.startDate = startDate
      this.endDate = endDate

      // For calendar
      this.calendar.show = false
      this.calendar.value = [
        startDate.format('Y.M.D').split('.'),
        endDate.format('Y.M.D').split('.')
      ]
    },

    setDuration(duration) {
      if (this.duration === duration) return

      this.showedTrnsCategoryId = []
      this.selectedPeriodIndex = 0
      this.$store.commit('setDuration', duration)

      const startDate = moment(this.endDate).subtract(duration - 1, 'days')
      const endDate = moment(this.endDate)

      // For trns
      this.startDate = startDate
      this.endDate = endDate

      // For calendar
      this.calendar.show = false
      this.calendar.value = [
        startDate.format('Y.M.D').split('.'),
        endDate.format('Y.M.D').split('.')
      ]

      // For period
      this.periodsStartDate = startDate
      this.periodsEndDate = endDate
    },

    getCategoryGraphWidth(total, trns) {
      const width = total / trns[0].total * 100
      const renderWidth = width > 0 ? width : 0
      return { width: `calc(${renderWidth}%)` }
    },

    getPeriodGraphHeight(value) {
      const dataSorted = orderBy(this.periodsData, e => e.incomes > e.expenses ? e.incomes : e.expenses, 'desc')
      const biggest = dataSorted[0].incomes > dataSorted[0].expenses ? dataSorted[0].incomes : dataSorted[0].expenses
      const height = value / biggest * 100

      let renderHeight
      height > 0
        ? renderHeight = height > 1 ? height : 1
        : renderHeight = 0

      return {
        height: `calc(${renderHeight}%)`
      }
    },

    getPeriodGraphWidth(value) {
      const dataSorted = orderBy(this.periodsData, e => e.incomes > e.expenses ? e.incomes : e.expenses, 'desc')
      const biggest = dataSorted[0].incomes > dataSorted[0].expenses ? dataSorted[0].incomes : dataSorted[0].expenses
      const height = value / biggest * 100

      let renderHeight
      height > 0
        ? renderHeight = height > 1 ? height : 1
        : renderHeight = 0

      return {
        width: `calc(${renderHeight}%)`
      }
    },

    toogleShowTrnsInCategory(categoryId) {
      this.showedTrnsCategoryId.indexOf(categoryId) === -1
        ? this.showedTrnsCategoryId.push(categoryId)
        : this.showedTrnsCategoryId = this.showedTrnsCategoryId.filter(cId => cId !== categoryId)
    },

    changeTab(tab) {
      this.showedTab = tab
    },

    countSum(trns) {
      return trns.reduce((sum, current) => sum + current.amountRub, 0)
    },

    formatTrnsForStat(trns) {
      if (trns && trns.length > 0) {
        // Create array of categories ids
        const catsIds = uniqBy(trns, 'categoryId').map(trn => trn.categoryId)

        // Create array of objects with data in categories
        const data = catsIds.map((id) => {
          const trnsInCategory = trns.filter(trn => trn.categoryId === id)
          const total = trnsInCategory.reduce((sum, current) => sum + current.amountRub, 0)
          const category = this.categories.find(c => c.id === id)
          return {
            id,
            name: category.name,
            total,
            icon: category.icon,
            color: category.color,
            trns: trnsInCategory
          }
        })
        return orderBy(data, d => d.total, 'desc')
      }
      return []
    }
  }
}
</script>

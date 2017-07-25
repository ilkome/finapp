<template lang="pug">
.content
  .module
    h3.title._mbs
      .title__calendar(@click="openPopupCalendar($event)")
        .title__calendar__icon.mdi.mdi-calendar-multiple
        .title__calendar__name {{ showedDate.first }}
        .title__calendar__sup(v-if="showedDate.second !== 'Today'") {{ showedDate.second }}

      transition(name="fade2")
        .calendar-dropdown(
          :style="{'left':calendar.left+'px','top':calendar.top+'px'}",
          v-if="calendar.show"
        )
          .calendarPeriod
            .calendarPeriod__group
              .calendarPeriod__item(
                :class="{_active: duration === 1 && isLastDays}"
                @click.prevent="setDuration(1)"
              ) Today
            .calendarPeriod__group
              .calendarPeriod__item(
                :class="{_active: duration === 10 && isLastDays}"
                @click.prevent="setDuration(10)"
              ) Last 10 days
              .calendarPeriod__item(
                :class="{_active: duration === 30 && isLastDays}"
                @click.prevent="setDuration(30)"
              ) Last 30 days
              .calendarPeriod__item(
                :class="{_active: duration === 365 && isLastDays}"
                @click.prevent="setDuration(365)"
              ) Last 365 days
            .calendarPeriod__group
              .calendarPeriod__item(
                :class="{_active: calendarPreset === 'isoweek' && isLastDays}",
                @click.prevent="setDates('isoweek')"
              ) This week
              .calendarPeriod__item(
                :class="{_active: calendarPreset === 'month' && isLastDays}",
                @click.prevent="setDates('month')"
              ) This month
              .calendarPeriod__item(
                :class="{_active: calendarPreset === 'year' && isLastDays}",
                @click.prevent="setDates('year')"
              ) This year
          Calendar(
            :range="calendar.range",
            :zero="calendar.zero",
            :value="calendar.value"
            @select="selectCalendarDates"
          )

    .gridTable._static
        //- Statistic
        //------------------------------------------------
        .gridTable__item
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

        //- Previous
        //------------------------------------------------
        .gridTable__item
          .itemStatLine(
            v-for="(period, index) in periodsData",
            @click.prevent="selectPeriodStat(index)",
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
                .itemStatLine__graph
                  template(v-if="period.expenses > 0")
                    .itemStatLine__graph__in._expense(:style="getPeriodGraphWidth(period.expenses)")
  //- Tabs
  //------------------------------------------------
  template(v-if="(incomesCategoriesData.length || expensesCategoriesData.length) > 0")
    .tabs
      a(@click="changeTab('statistic')", :class="{_active: showedTab === 'statistic'}") Statistic
      a(@click="changeTab('trns')", :class="{_active: showedTab === 'trns'}") History


    .module._bg(v-show="showedTab === 'statistic'")
      .gridTable._statItems
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
              .itemStat._link._clear(:class="{_opened: showedTrnsCategoryId.indexOf(itemStat.id) !== -1}")
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
import moment from 'moment'
import date from 'date-fns'
import uniqBy from 'lodash/uniqBy'
import orderBy from 'lodash/orderBy'
import formatMoney from '../mixins/formatMoney'
import formatDate from '../mixins/formatDate'
import Calendar from './calendar/calendar.vue'
import TrnsList from './TrnsList.vue'
import TrnItem from './TrnItem.vue'

export default {
  mixins: [formatDate, formatMoney],
  components: { TrnsList, TrnItem, Calendar },

  data() {
    return {
      showedDate: {},
      showedTab: 'statistic',
      days: [1, 5, 10, 7, 14, 30, 999],
      selectedPeriodIndex: 0,
      showedTrnsCategoryId: [],
      avDays: 180,
      trnsDate: {
        start: '',
        end: ''
      },
      calendar: {}
    }
  },

  mounted() {
    this.$el.addEventListener('click', this.closePopCalendar)
  },

  beforeDestroy() {
    this.$el.removeEventListener('click', this.closePopCalendar)
  },

  beforeMount() {
    this.trnsDate.start = this.globalDate.start
    this.trnsDate.end = this.globalDate.end
    this.calendar = {
      show: false,
      range: true,
      zero: true,
      value: [
        moment(this.globalDate.start).format('Y.M.D').split('.'),
        moment(this.globalDate.end).format('Y.M.D').split('.')
      ]
    }

    if (this.isLastDays) {
      this.showedDate.first = this.formatDates(this.trnsDate.start, this.trnsDate.end, 'period')
      this.showedDate.second = this.formatDates(this.trnsDate.start, this.trnsDate.end, 'date')
    } else {
      this.showedDate.first = this.formatDates(this.trnsDate.start, this.trnsDate.end, 'date')
      this.showedDate.second = this.formatDates(this.trnsDate.start, this.trnsDate.end, 'period')
    }

    document.addEventListener('keyup', (event) => {
      if (event.keyCode === 27) { // escape key
        console.log('document.addEventListener: keyup')
        this.calendar.show = false
      }
    })
  },

  computed: {
    ...mapGetters(['categories', 'getTrns']),

    globalDate() {
      return {
        start: moment(this.$store.state.dates.start).startOf('day').valueOf(),
        end: moment(this.$store.state.dates.end).startOf('day').valueOf()
      }
    },

    isLastDays() {
      if (moment(this.globalDate.end).endOf('day').valueOf() === moment().endOf('day').valueOf()) {
        return true
      }
      return false
    },

    calendarPreset() {
      return this.$store.state.dashboard.calendarPreset
    },

    duration() {
      return this.$store.state.filter.duration
    },

    trnsList() {
      return this.getTrns(this.trnsDate.start, this.trnsDate.end)
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
      const incomes = this.incomesTrns.reduce((sum, current) => sum + current.amountRub, 0)
      const expenses = this.expensesTrns.reduce((sum, current) => sum + current.amountRub, 0)
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

      for (let period = 0; period <= 2; period++) {
        const periodDuration = this.duration * period
        let periodStartDate = moment(this.globalDate.start).subtract(periodDuration, 'days').startOf('day')
        let periodEndDate = moment(this.globalDate.end).subtract(periodDuration, 'days').endOf('day')

        if (this.calendarPreset) {
          switch (this.calendarPreset) {
            case 'isoweek':
              periodStartDate = moment(this.globalDate.start).subtract(period, 'weeks').startOf('isoweek')
              periodEndDate = moment(this.globalDate.start).subtract(period, 'weeks').endOf('isoweek')
              break
            case 'month':
              periodStartDate = moment(this.globalDate.start).subtract(period, 'months').startOf('month')
              periodEndDate = moment(this.globalDate.start).subtract(period, 'months').endOf('month')
              break
            case 'year':
              periodStartDate = moment(this.globalDate.start).subtract(period, 'years').startOf('year')
              periodEndDate = moment(this.globalDate.start).subtract(period, 'years').endOf('year')
              break
          }

          if (period === 0) periodEndDate = moment().endOf('day')
        }

        let periodName = this.formatDates(periodStartDate, periodEndDate, 'date')
        if ((period === 0 || this.calendarPreset) && this.isLastDays) {
          periodName = this.formatDates(periodStartDate, periodEndDate, 'period')
        }

        const periodTrns = this.getTrns(moment(periodStartDate).valueOf(), moment(periodEndDate).valueOf())
        const periodIncomes = periodTrns
          .filter(t => t.type === 1)
          .reduce((sum, current) => sum + current.amountRub, 0)
        const periodExpenses = periodTrns
          .filter(t => t.type === 0)
          .reduce((sum, current) => sum + current.amountRub, 0)
        const periodTotal = periodIncomes - periodExpenses

        data.push({
          period,
          date: periodName,
          incomes: periodIncomes,
          expenses: periodExpenses,
          total: periodTotal
        })
      }

      return data
    }
  },

  methods: {
    setDuration(duration) {
      this.calendarPreset = false
      this.showedTrnsCategoryId = []
      this.selectedPeriodIndex = 0

      const startDate = moment().subtract(duration - 1, 'days').startOf('day')
      const endDate = moment().endOf('day')

      this.$store.commit('setDuration', duration)
      this.$store.commit('setDates', { start: startDate, end: endDate })
      this.$store.commit('setCalendarPreset', null)

      // Trns
      this.trnsDate.start = startDate
      this.trnsDate.end = endDate

      // Title
      this.showedDate.first = this.formatDates(this.trnsDate.start, this.trnsDate.end, 'period')
      this.showedDate.second = this.formatDates(this.trnsDate.start, this.trnsDate.end, 'date')

      // Calendar
      this.calendar.show = false
      this.calendar.value = [
        moment(startDate).format('Y.M.D').split('.'),
        moment(endDate).format('Y.M.D').split('.')
      ]
    },

    selectPeriodStat(index) {
      if (this.selectedPeriodIndex === index) return

      this.showedTrnsCategoryId = []
      this.selectedPeriodIndex = index

      let startDate = moment(this.globalDate.start).subtract(this.duration * index, 'days')
      let endDate = moment(this.globalDate.end).subtract(this.duration * index, 'days')

      // Week
      if (this.calendarPreset === 'isoweek') {
        startDate = moment(this.globalDate.start).subtract(index, 'weeks').startOf('isoweek')
        if (index === 0) endDate = moment(this.globalDate.end).endOf('day')
        else endDate = moment(this.globalDate.start).subtract(index, 'weeks').endOf('isoweek')
      }

      // Month
      if (this.calendarPreset === 'month') {
        startDate = moment(this.globalDate.start).subtract(index, 'months').startOf('month')
        if (index === 0) endDate = moment(this.globalDate.end).endOf('day')
        else endDate = moment(this.globalDate.end).subtract(index, 'months').endOf('month')
      }

      // Year
      if (this.calendarPreset === 'year') {
        startDate = moment(this.globalDate.start).subtract(index, 'years').startOf('year')
        if (index === 0) endDate = moment(this.globalDate.end).endOf('day')
        else endDate = moment(this.globalDate.end).subtract(index, 'years').endOf('year')
      }

      // Trns
      this.trnsDate.start = startDate
      this.trnsDate.end = endDate

      // Title
      if ((index === 0 || this.calendarPreset) && this.isLastDays) {
        this.showedDate.first = this.formatDates(this.trnsDate.start, this.trnsDate.end, 'period')
        this.showedDate.second = this.formatDates(this.trnsDate.start, this.trnsDate.end, 'date')
      } else {
        this.showedDate.first = this.formatDates(this.trnsDate.start, this.trnsDate.end, 'date')
        this.showedDate.second = this.formatDates(this.trnsDate.start, this.trnsDate.end, 'period')
      }

      // Calendar
      this.calendar.show = false
      this.calendar.value = [
        moment(startDate).format('Y.M.D').split('.'),
        moment(endDate).format('Y.M.D').split('.')
      ]
    },

    selectCalendarDates(startCalendar, endCalendar) {
      const startDate = moment(startCalendar.join('.'), 'Y.M.D').startOf('day')
      const endDate = moment(endCalendar.join('.'), 'Y.M.D').endOf('day')

      this.calendar.show = false
      this.calendar.value = [startCalendar, endCalendar]

      this.selectedPeriodIndex = 0

      const duration = endDate.diff(startDate, 'days') + 1
      this.$store.commit('setDuration', duration)
      this.$store.commit('setDates', { start: startDate, end: endDate })
      this.$store.commit('setCalendarPreset', null)

      // Trns
      this.trnsDate.start = startDate
      this.trnsDate.end = endDate

      if (this.isLastDays) {
        this.showedDate.first = this.formatDates(this.trnsDate.start, this.trnsDate.end, 'period')
        this.showedDate.second = this.formatDates(this.trnsDate.start, this.trnsDate.end, 'date')
      } else {
        this.showedDate.first = this.formatDates(this.trnsDate.start, this.trnsDate.end, 'date')
        this.showedDate.second = this.formatDates(this.trnsDate.start, this.trnsDate.end, 'period')
      }
    },

    setDates(period) {
      this.calendarPreset = period
      this.showedTrnsCategoryId = []
      this.selectedPeriodIndex = 0

      let duration = 1
      switch (period) {
        case 'isoweek':
          duration = 7
          break
        case 'month':
          duration = 31
          break
        case 'year':
          duration = 365 * 2
          break
      }

      const startDate = moment().startOf(period).valueOf()
      const endDate = moment().endOf('day').valueOf()

      this.$store.commit('setDuration', duration)
      this.$store.commit('setDates', { start: startDate, end: endDate })
      this.$store.commit('setCalendarPreset', period)

      // Trns
      this.trnsDate.start = startDate
      this.trnsDate.end = endDate

      // Title
      this.showedDate.first = this.formatDates(this.trnsDate.start, this.trnsDate.end, 'period')
      this.showedDate.second = this.formatDates(this.trnsDate.start, this.trnsDate.end, 'date')

      // Calendar
      this.calendar.show = false
      this.calendar.value = [
        moment(this.trnsDate.start).format('Y.M.D').split('.'),
        moment(this.trnsDate.end).format('Y.M.D').split('.')
      ]
    },

    formatDates(start, end, type) {
      const startDate = moment(start).startOf('day')
      const endDate = moment(end).endOf('day').valueOf()
      const endOfToday = moment().endOf('day').valueOf()

      // Same day
      if (moment(startDate).endOf('day').valueOf() === moment(endDate).endOf('day').valueOf()) {
        // Today
        if (moment(startDate).endOf('day').valueOf() === endOfToday) {
          if (type === 'date') {
            return `${moment(startDate).format('D MMM')}`
          }
          return 'Today'
        }
        // Yestarday
        if (moment(startDate).endOf('day').valueOf() === moment(endOfToday).subtract(1, 'day').valueOf()) {
          if (type === 'date') {
            return 'Yestarday'
          }
          return `${moment(startDate).format('D MMM')}`
        }
      }

      // Date
      if (type === 'date') {
        // Same yaer
        if (moment(startDate).format('Y') === moment(endDate).format('Y')) {
          // Same month
          if (moment(startDate).format('M') === moment(endDate).format('M')) {
            // Same day
            if (moment(startDate).format('D') === moment(endDate).format('D')) {
              return `${moment(startDate).format('D MMM')}`
            } else {
              return `${moment(startDate).format('D')} - ${moment(endDate).format('D')} ${moment(endDate).format('MMM')}`
            }
          } else {
            return `${moment(startDate).format('D MMM')} - ${moment(endDate).format('D MMM')}`
          }
        }

        // Differnt year
        if (moment(startDate).format('Y') !== moment(endDate).format('Y')) {
          // Same month
          if (moment(startDate).format('M') === moment(endDate).format('M')) {
            // Same day
            if (moment(startDate).format('D') === moment(endDate).format('D')) {
              return `${moment(startDate).format('D MMM YY')}`
            } else {
              return `${moment(startDate).format('D MMM YY')} - ${moment(endDate).format('D MMM YY')}`
            }
          } else {
            return `${moment(startDate).format('D MMM YY')} - ${moment(endDate).format('D MMM YY')}`
          }
        }
      }

      // Period
      if (type === 'period') {
        // Calendar Preset
        if (this.calendarPreset) {
          let difference = ''

          switch (this.calendarPreset) {
            case 'isoweek':
              difference = date.differenceInCalendarWeeks(this.globalDate.end, startDate)
              switch (difference) {
                case 0: return `This week`
                case 1: return `Last week`
                default: return `${difference} weeks ago`
              }
            case 'month':
              difference = date.differenceInCalendarMonths(this.globalDate.end, startDate)
              switch (difference) {
                case 0: return `This month`
                case 1: return `Last month`
                default: return `${difference} months ago`
              }
            case 'year':
              difference = date.differenceInCalendarYears(this.globalDate.end, startDate)
              switch (difference) {
                case 0: return `This year`
                case 1: return `Last year`
                default: return `${difference} years ago`
              }
            default: return `No date`
          }
        }

        // Numbers
        if (!this.calendarPreset) {
          // First period
          if (endDate === endOfToday) {
            return `Last ${this.duration} days`
          }

          // Other periods
          if (endDate !== endOfToday) {
            return `${this.duration} days`
          }
        }
      }
    },

    openPopupCalendar(event) {
      this.calendar.show = !this.calendar.show
      this.calendar.left = event.target.closest('.title').offsetLeft - 5
      this.calendar.top = event.target.closest('.title').offsetTop + 45
    },

    closePopCalendar(event) {
      const link = this.$el.querySelector('.title._mbs')
      const target = event.target

      if (target.contains(link)) {
        if (this.calendar.show) {
          this.calendar.show = false
        }
      }
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

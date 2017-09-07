<template lang="pug">
.component
  .module
    .module-in
      //- Page date header
      .dateTitle
        //- Current date
        .dateTitle__item
          h1.dateTitle__header(@click.prevent.stop="openPopupCalendar($event)")
            .dateTitle__icon.mdi.mdi-calendar-multiple
            .dateTitle__firstDate {{ showedDate.first }}
            .dateTitle__secondDate(v-if="showedDate.second !== 'Today'") {{ showedDate.second }}

        //- Days
        .dateTitle__item
          .dateTitle__periods
            .dateTitle__periods__item
              .fa.fa-object-group(@click.prevent="toogleGroupByParent")
            .dateTitle__periods__item(
              :class="{_active: duration === 10 && isLastDays}"
              @click.prevent.stop="setDuration(10)"
            ) 10 days
            .dateTitle__periods__item(
              :class="{_active: duration === 30 && isLastDays}"
              @click.prevent.stop="setDuration(30)"
            ) 30 days
            .dateTitle__periods__item(
              :class="{_active: calendarPreset === 'isoweek' && isLastDays}",
              @click.prevent.stop="setDates('isoweek')"
            ) Week
            .dateTitle__periods__item(
              :class="{_active: calendarPreset === 'month' && isLastDays}",
              @click.prevent.stop="setDates('month')"
            ) Month

        //- Dropdown
        transition(name="fade2")
          .calendar-dropdown(
            :style="{'left':calendar.left+'px','top':calendar.top+'px'}",
            v-if="calendar.show")
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

            //- Calendar
            Calendar(
              :range="calendar.range",
              :zero="calendar.zero",
              :value="calendar.value"
              @select="selectCalendarDates"
            )


      //- Together
      //------------------------------------------------
      template
        .gridTable._periods
          .gridTable__item(v-for="(period, index) in previousData")
            .itemStat._link(
              @click.prevent="selectPeriodStat(index)",
              :class="{ _active: selectedPeriodIndex === index }")
              .itemStat__in
                .itemStat__content
                  .itemStat__text
                    .itemStat__name {{ period.date }}
                    .itemStat__price.sum {{ formatMoney(period.incomes - period.expenses) }}
                  .itemStat__graph
                    .itemStat__graph__in._income(:style="getPreviousDataGraphWidth(period.incomes)")
                      .itemStat__graph__in__price {{ formatMoney(period.incomes) }}
                  .itemStat__graph
                    .itemStat__graph__in._expense(:style="getPreviousDataGraphWidth(period.expenses)")
                      .itemStat__graph__in__price {{ formatMoney(period.expenses) }}

  //- Tabs
  //------------------------------------------------
  template
    template(v-if="(incomesItemStat.length || expensesItemStat.length) !== 0")
      .tabs
         .tabs-in
           a(
             @click="changeTab('charts')",
             :class="{_active: showedTab === 'charts'}") Charts
           a(
             @click="changeTab('stat')",
             :class="{_active: showedTab === 'stat'}") Statistic
           a(
             @click="changeTab('history')",
             :class="{_active: showedTab === 'history'}") History

      //- Content
      .module._bg._minHeight
        .module-in
          //- Charts
          template(v-if="showedTab === 'charts'")
            .gridTable
              //- Expenses
              //------------------------------------------------
              .gridTable__item(v-if="expensesItemStat.length > 0")
                h2.title.expenses._mbm.moneyTitle Expenses
                SummaryShort(:trns="trnsList", view="dashboard-expenses")

                template(v-for="itemStat in expensesItemStat")
                  .itemStat._link._small._categoryStat(:class="{_opened: showedTrnsCategoryId.indexOf(itemStat.id) !== -1}")
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
                          .itemStat__graph__in._expense(:style="getCategoryGraphWidth(itemStat.total, expensesItemStat)")

                    template(v-if="groupedByParent")
                      template(v-if="showedTrnsCategoryId.indexOf(itemStat.id) !== -1")
                        template(v-if="showCategoryStat(itemStat.id, 'expense').length && showCategoryStat(itemStat.id, 'expense').length > 1")
                          template(v-for="itemStatChild in showCategoryStat(itemStat.id, 'expense')")
                            .itemStat._link._child(:class="{_opened: showedTrnsCategoryId.indexOf(itemStatChild.id) !== -1}")
                              .itemStat__in(@click.prevent="toogleShowTrnsInCategory(itemStatChild.id)")
                                router-link.itemStat__icon(
                                  :to="`/categories/${itemStatChild.id}`",
                                  title="Go to category"
                                )
                                  .icon(:style="`background: ${itemStatChild.color}`")
                                    div(:class="itemStatChild.icon")
                                .itemStat__content
                                  .itemStat__text
                                    .itemStat__name {{ itemStatChild.name }}
                                    .itemStat__price.sum {{ formatMoney(itemStatChild.total) }}
                                  .itemStat__graph
                                    .itemStat__graph__in._expense(:style="getCategoryGraphWidth(itemStatChild.total, expensesItemStat)")

                              template(v-if="showedTrnsCategoryId.indexOf(itemStatChild.id) !== -1")
                                .itemStat__trns
                                  TrnItem(
                                    v-for="trn in itemStatChild.trns.filter(trn => trn.type === 0).slice(0, 20)",
                                    :trn="trn",
                                    :key="trn.id",
                                    view="small")

                        template(v-else)
                          .itemStat__trns
                            TrnItem(
                              v-for="trn in itemStat.trns.slice(0, 20)",
                              :trn="trn",
                              :key="trn.id",
                              view="small")

              //- Incomes
              //------------------------------------------------
              .gridTable__item(v-if="incomesItemStat.length > 0")
                h2.title.incomes._wide._mbm.moneyTitle Incomes
                SummaryShort(:trns="trnsList", view="dashboard-incomes")

                template(v-for="itemStat in incomesItemStat")
                  .itemStat._link._small._categoryStat(:class="{_opened: showedTrnsCategoryId.indexOf(itemStat.id) !== -1}")
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
                          .itemStat__graph__in._income(:style="getCategoryGraphWidth(itemStat.total, incomesItemStat)")

                    template(v-if="showedTrnsCategoryId.indexOf(itemStat.id) !== -1")
                      template(v-if="showCategoryStat(itemStat.id, 'incomes').length && showCategoryStat(itemStat.id, 'incomes').length > 1")
                        template(v-for="itemStatChild in showCategoryStat(itemStat.id, 'incomes')")
                          .itemStat._link._small._child(:class="{_opened: showedTrnsCategoryId.indexOf(itemStatChild.id) !== -1}")
                            .itemStat__in(@click.prevent="toogleShowTrnsInCategory(itemStatChild.id)")
                              router-link.itemStat__icon(
                                :to="`/categories/${itemStatChild.id}`",
                                title="Go to category"
                              )
                                .icon(:style="`background: ${itemStatChild.color}`")
                                  div(:class="itemStatChild.icon")
                              .itemStat__content
                                .itemStat__text
                                  .itemStat__name {{ itemStatChild.name }}
                                  .itemStat__price.sum {{ formatMoney(itemStatChild.total) }}
                                .itemStat__graph
                                  .itemStat__graph__in._income(:style="getCategoryGraphWidth(itemStatChild.total, incomesItemStat)")

                            template(v-if="showedTrnsCategoryId.indexOf(itemStatChild.id) !== -1")
                              .itemStat__trns
                                TrnItem(
                                  v-for="trn in itemStatChild.trns.slice(0, 20)",
                                  :trn="trn",
                                  :key="trn.id",
                                  view="small")

                      template(v-else)
                        .itemStat__trns
                          TrnItem(
                            v-for="trn in itemStat.trns.slice(0, 20)",
                            :trn="trn",
                            :key="trn.id",
                            view="small")

          //- Statistic
          template(v-if="showedTab === 'stat'")
            .gridTable._summary
              .gridTable__item
                SummaryShort(:trns="trnsList", view="dashboard-average", :maxwidth="true")

              .gridTable__item
                SummaryShort(:trns="trnsList", view="day", :maxwidth="true")

              .gridTable__item(v-if="duration > 14")
                SummaryShort(:trns="trnsList", view="week", :maxwidth="true")

              .gridTable__item(v-if="duration > 60")
                SummaryShort(:trns="trnsList", view="month", :maxwidth="true")

          //- History
          template(v-if="showedTab === 'history'")
              TrnsList(:trns="trnsList.slice(0, 100)")
</template>


<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import date from 'date-fns'
import uniqBy from 'lodash/uniqBy'
import orderBy from 'lodash/orderBy'
import formatMoney from '../mixins/formatMoney'
import Calendar from './calendar/calendar.vue'
import TrnsList from './TrnsList.vue'
import TrnItem from './TrnItem.vue'
import SummaryShort from './SummaryShort.vue'

export default {
  name: 'DashboardPage',
  mixins: [formatMoney],
  components: { TrnsList, TrnItem, Calendar, SummaryShort },

  data() {
    return {
      showedDate: {},
      showedTab: 'charts',
      groupedByParent: true,
      selectedPeriodIndex: 0,
      showedTrnsCategoryId: [],
      trnsDate: {
        start: '',
        end: ''
      },
      calendar: {}
    }
  },

  mounted() {
    document.querySelector('body').addEventListener('click', this.closePopCalendar)
  },

  beforeDestroy() {
    document.querySelector('body').removeEventListener('click', this.closePopCalendar)
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
        this.calendar.show = false
      }
    })
  },

  computed: {
    ...mapGetters(['categories', 'trns', 'getTrns']),

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
      if (this.calendarPreset === 'all') {
        return this.getTrns()
      } else {
        return this.getTrns({ startDate: this.trnsDate.start, endDate: this.trnsDate.end, accountId: 11 })
      }
    },

    incomesTrns() {
      return this.trnsList.filter(t => t.type === 1)
    },

    expensesTrns() {
      return this.trnsList.filter(t => t.type === 0)
    },

    incomesItemStat() {
      return this.formatTrnsForStat(this.incomesTrns)
    },

    expensesItemStat() {
      return this.formatTrnsForStat(this.expensesTrns)
    },

    previousData() {
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

        if (periodTrns.length || period <= 2) {
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
        } else {
          break
        }
      }

      return data
    }
  },

  methods: {
    getTrnsInCategoryWithChildren(categoryId) {
      const category = this.categories.find(category => category.id === categoryId)
      const childCategories = this.categories.filter(category => category.parentId === categoryId)
      let trns = []

      // Parent category
      // Trns only inside child categories
      if (category.parentId === 0) {
        trns = this.trnsList.filter(trn => {
          return childCategories.filter(category => category.id === trn.categoryId).length
        })
      }

      // Children category
      // Trns only in this category
      if (category.parentId !== 0) {
        trns = this.trnsList.filter(trn => trn.categoryId === categoryId)
      }

      return trns
    },

    showCategoryStat(categoryId, type) {
      const trnType = type === 'incomes' ? 1 : 0
      const trns = this.getTrnsInCategoryWithChildren(categoryId)
      const childCategories = this.categories.filter(category => category.parentId === categoryId)

      // Create array of objects with data in categories
      const data = []
      childCategories.map((category) => {
        const trnsInCategory = trns.filter(trn => trn.categoryId === category.id && trn.type === trnType)
        const total = trnsInCategory.reduce((sum, current) => sum + current.amountRub, 0)
        const trnsCategory = this.categories.find(c => c.id === category.id)
        if (total > 0) {
          data.push({
            id: category.id,
            category: trnsCategory,
            name: trnsCategory.name,
            total,
            icon: trnsCategory.icon,
            color: trnsCategory.color,
            trns: trnsInCategory
          })
        }
      })
      return orderBy(data, d => d.total, 'desc')
    },

    toogleGroupByParent() {
      this.groupedByParent = !this.groupedByParent
    },

    setDuration(duration) {
      this.$store.commit('showLoader', 'show')
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

      this.$store.commit('closeLoader')
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
              difference = date.differenceInWeeks(this.globalDate.end, startDate)
              switch (difference) {
                case 0: return `This week`
                case 1: return `Last week`
                default: return `${difference} weeks ago`
              }
            case 'month':
              difference = date.differenceInMonths(this.globalDate.end, startDate)
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
      this.calendar.left = event.target.closest('.dateTitle__header').offsetLeft - 0
      this.calendar.top = event.target.closest('.dateTitle__header').offsetTop + 88
    },

    closePopCalendar(event) {
      const link = document.querySelector('.dateTitle__header')
      const target = event.target

      // Clicks inside '.dateTitle__header'
      if (target.contains(link)) {
        if (this.calendar.show) {
          this.calendar.show = false
        }
      } else {
        this.calendar.show = false
      }
    },

    getCategoryGraphWidth(total, trns) {
      const width = total / trns[0].total * 100
      const renderWidth = width > 0 ? width : 0
      return { width: `calc(${renderWidth}%)` }
    },

    getPreviousDataGraphWidth(value) {
      const dataSorted = orderBy(this.previousData, e => e.incomes > e.expenses ? e.incomes : e.expenses, 'desc')
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
        // Grouped by parent category
        if (this.groupedByParent) {
          // Create array of categories ids
          const formatedTrns = trns.map(trn => {
            const trnCategory = this.categories.find(category => category.id === trn.categoryId)
            // It's root category
            if (trnCategory.parentId === 0) {
              return {
                ...trn,
                parentCategory: trnCategory,
                parentCategoryId: trnCategory.id
              }
            }

            // It's child category -> find parent category
            if (trnCategory.parentId !== 0) {
              const parentCategory = this.categories.find(category => category.id === trnCategory.parentId)
              return {
                ...trn,
                parentCategory,
                parentCategoryId: parentCategory.id
              }
            }
          })

          const catsIds = uniqBy(formatedTrns, 'parentCategory.id').map(trn => trn.parentCategory.id)

          // Create array of objects with data in categories
          const data = catsIds.map((id) => {
            const trnsInCategory = formatedTrns.filter(trn => trn.parentCategory.id === id)
            const total = trnsInCategory.reduce((sum, current) => sum + current.amountRub, 0)
            const category = this.categories.find(c => c.id === id)
            return {
              id,
              category: category,
              name: category.name,
              total,
              icon: category.icon,
              color: category.color,
              trns: trnsInCategory
            }
          })
          return orderBy(data, d => d.total, 'desc')
        }

        // Grouped by child category
        if (!this.groupedByParent) {
          // Create array of categories ids
          const catsIds = uniqBy(trns, 'categoryId').map(trn => trn.categoryId)

          // Create array of objects with data in categories
          const data = catsIds.map((id) => {
            const trnsInCategory = trns.filter(trn => trn.categoryId === id)
            const total = trnsInCategory.reduce((sum, current) => sum + current.amountRub, 0)
            const category = this.categories.find(c => c.id === id)
            return {
              id,
              category: category,
              name: category.name,
              total,
              icon: category.icon,
              color: category.color,
              trns: trnsInCategory
            }
          })
          return orderBy(data, d => d.total, 'desc')
        }
      }
      return []
    }
  }
}
</script>

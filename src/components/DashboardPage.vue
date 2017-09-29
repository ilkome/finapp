<template lang="pug">
.component
  //- Content
  .module._minHeight
    .module-in
      template
        //- Page date header
        .dateTitle
          //- Current date
          template(v-if="!$store.state.isMobile")
            .dateTitle__item
              h1.dateTitle__header(@click.prevent.stop="openPopupCalendar($event)")
                .dateTitle__icon.mdi.mdi-calendar-multiple
                .dateTitle__firstDate {{ $store.state.filter.filter.date.first }}
                .dateTitle__secondDate(v-if="$store.state.filter.filter.date.second !== 'Today'") {{ $store.state.filter.filter.date.second }}

            //- Days
            .dateTitle__item
              .dateTitle__periods
                .dateTitle__periods__item(
                  :class="{_active: duration === 10 && isLastDays}"
                  @click.prevent="setDuration(10)"
                ) 10 days
                .dateTitle__periods__item(
                  :class="{_active: calendarPreset === 'isoweek' && isLastDays}",
                  @click.prevent="setDates('isoweek')"
                ) Week
                .dateTitle__periods__item(
                  :class="{_active: calendarPreset === 'month' && isLastDays}",
                  @click.prevent="setDates('month')"
                ) Month
                .dateTitle__periods__item(
                  :class="{_active: calendarPreset === 'year' && isLastDays}",
                  @click.prevent="setDates('year')"
                ) Year
                .dateTitle__periods__item(
                  :class="{_active: calendarPreset === 'all' && isLastDays}",
                  @click.prevent="setDates('all')"
                ) All

          //- Calendar dropdown
          transition(name="calendarPopupAnimation")
            .calendar-dropdown(
              :style="{'left':$store.state.filter.filter.calendar.left+'px','top':$store.state.filter.filter.calendar.top+'px'}",
              v-if="$store.state.filter.filter.calendar.show")
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
                  .calendarPeriod__item(
                    :class="{_active: calendarPreset === 'all' && isLastDays}",
                    @click.prevent="setDates('all')"
                  ) All

              //- Calendar
              Calendar(
                :range="$store.state.filter.filter.calendar.range",
                :zero="$store.state.filter.filter.calendar.zero",
                :value="$store.state.filter.filter.calendar.value"
                @select="selectCalendarDates"
              )

      template(v-if="$store.state.isMobile")
        SummaryShort(:trns="trnsList", view="dashboard-new")

      template(v-if="selectedCategory || getFilter.account")
        .filter
          template(v-if="selectedCategory && getFilter.account")
            .icon._link._mr(@click.prevent="clearFilter()")
              .fa.fa-times
              .icon__label Clear filter

          template(v-if="getFilter.account")
            .icon._link._mr._link(@click.prevent="setFilterAccount(null)")
              .icon__abbr {{ getFilter.account.name.charAt(0) }}{{ getFilter.account.name.charAt(1) }}
              .icon__label Clear: {{ getFilter.account.name }}

          template(v-if="selectedCategory")
            .icon._mr._link(@click.prevent="setFilterCategory(null)", :style="`background: ${selectedCategory.color}`")
              div(:class="selectedCategory.icon")
              .icon__label Clear: {{ selectedCategory.name }}

      .gridTable._dashboard
        .gridTable__item
          .switch
            .switch__item
              a._expenses(
                @click="changeTabMoney('expenses')",
                :class="{_active: showedTabMoney === 'expenses'}") Expenses
            .switch__item
              a._incomes(
                @click="changeTabMoney('incomes')",
                :class="{_active: showedTabMoney === 'incomes'}") Incomes
            .switch__item
              a._history(
                @click="changeTabMoney('history')",
                :class="{_active: showedTabMoney === 'history'}") History

          //- Expenses
          template(v-if="expensesItemStats.length > 0 && showedTabMoney === 'expenses'")
            .itemStatGroup
              //- h2.title.expenses._mbm.moneyTitle Expenses
              SummaryShort(:trns="trnsList", view="dashboard-expenses")

              ItemStat(
                v-for="itemStat in expensesItemStats"
                :key="itemStat.id"
                :idsOfOpenedCategories="idsOfOpenedCategories"
                :item="itemStat"
                :trns="expensesItemStats"
                type="expenses"
                v-on:onClickItem="toogleShowTrnsInCategory"
                v-on:onClickIcon="setFilterCategory"
              )
                template(slot="inside")
                  template(v-if="shouldOpenCategory(itemStat.id)")
                    template(v-if="getCategoryStat(itemStat.id, 'expenses').length")
                      ItemStat(
                        v-for="itemStatChild in getCategoryStat(itemStat.id, 'expenses')"
                        :key="itemStatChild.id"
                        :idsOfOpenedCategories="idsOfOpenedCategories"
                        :item="itemStatChild"
                        :trns="getCategoryStat(itemStat.id, 'expenses')"
                        type="expenses"
                        :isChild="true"
                        v-on:onClickItem="toogleShowTrnsInCategory"
                        v-on:onClickIcon="setFilterCategory"
                      )
                        template(slot="inside")
                          template(v-if="shouldOpenCategory(itemStatChild.id)")
                            .itemStat__trns
                              TrnItem(
                                v-for="trn in itemStatChild.trns.filter(trn => trn.type === 0).slice(0, 20)",
                                :trn="trn",
                                :key="trn.id"
                                v-on:onClickAccount="setFilterAccount"
                                view="small")

                    template(v-else)
                      .itemStat__trns
                        TrnItem(
                          v-for="trn in itemStat.trns.slice(0, 20)",
                          :trn="trn",
                          :key="trn.id"
                          v-on:onClickAccount="setFilterAccount"
                          view="small")

          //- Incomes
          template(v-if="incomesItemStats.length > 0 && showedTabMoney === 'incomes'")
            .itemStatGroup
              //- h2.title.incomes._wide._mbm.moneyTitle Incomes
              SummaryShort(:trns="trnsList", view="dashboard-incomes")
              ItemStat(
                v-for="itemStat in incomesItemStats"
                :key="itemStat.id"
                :idsOfOpenedCategories="idsOfOpenedCategories"
                :item="itemStat"
                :trns="incomesItemStats"
                type="incomes"
                v-on:onClickItem="toogleShowTrnsInCategory"
                v-on:onClickIcon="setFilterCategory"
              )
                template(slot="inside")
                  template(v-if="shouldOpenCategory(itemStat.id)")
                    //- Show child category
                    template(v-if="getCategoryStat(itemStat.id, 'incomes').length")
                      ItemStat(
                        v-for="itemStatChild in getCategoryStat(itemStat.id, 'incomes')"
                        :key="itemStatChild.id"
                        :idsOfOpenedCategories="idsOfOpenedCategories"
                        :item="itemStatChild"
                        :trns="getCategoryStat(itemStat.id, 'incomes')"
                        type="incomes"
                        :isChild="true"
                        v-on:onClickItem="toogleShowTrnsInCategory"
                        v-on:onClickIcon="setFilterCategory"
                      )
                        template(slot="inside")
                          template(v-if="shouldOpenCategory(itemStatChild.id)")
                            .itemStat__trns
                              TrnItem(
                                v-for="trn in itemStatChild.trns.filter(trn => trn.type === 1).slice(0, 20)",
                                :trn="trn",
                                :key="trn.id"
                                v-on:onClickAccount="setFilterAccount"
                                view="small")
                    //- Show trns
                    template(v-else)
                      .itemStat__trns
                        TrnItem(
                          v-for="trn in itemStat.trns.slice(0, 20)",
                          :trn="trn",
                          :key="trn.id",
                          v-on:onClickAccount="setFilterAccount"
                          view="small")
          template(v-if="showedTabMoney === 'history'")
            .itemStatGroup
              TrnsList(:trns="trnsListHistory.slice(0, 100)")

        template(v-if="!$store.state.isMobile")
          .gridTable__item
            SummaryShort(:trns="trnsList", view="dashboard-new")

            template(v-if="calendarPreset !== 'all' && !$store.state.isMobile")
              //- h3.numberTitle Periods
              .itemStat._link._small(
                v-for="(period, index) in previousData",
                @click.prevent="selectPeriodStat(index)",
                :class="{ _active: selectedPeriodIndex === index }")
                .itemStat__in
                  .itemStat__content
                    .itemStat__text
                      .itemStat__name {{ period.date }}
                      .itemStat__price.sum {{ formatMoney(period.incomes - period.expenses) }}
                    .itemStat__graph(@click.prevent="changeTabMoney('incomes')")
                      .itemStat__graph__in._income(:style="getPreviousDataGraphWidth(period.incomes)")
                        .itemStat__graph__in__price {{ formatMoney(period.incomes) }}
                    .itemStat__graph(@click.prevent="changeTabMoney('expenses')")
                      .itemStat__graph__in._expense(:style="getPreviousDataGraphWidth(period.expenses)")
                        .itemStat__graph__in__price {{ formatMoney(period.expenses) }}
              .btn(@click.prevent="showedPeriod++") Show more
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import date from 'date-fns'
import orderBy from 'lodash/orderBy'
import formatMoney from '../mixins/formatMoney'
import getCategoriesStatFromTrns from '../mixins/getCategoriesStatFromTrns'
import Calendar from './calendar/calendar.vue'
import TrnsList from './TrnsList.vue'
import TrnItem from './TrnItem.vue'
import SummaryShort from './SummaryShort.vue'
import ItemStat from './ItemStat.vue'

export default {
  name: 'DashboardPage',
  mixins: [formatMoney, getCategoriesStatFromTrns],
  components: { ItemStat, TrnsList, TrnItem, Calendar, SummaryShort },

  data() {
    return {
      accountId: null,
      categoryId: null,
      showedTab: 'alt',
      showedTabMoney: 'expenses',
      groupedByParent: true,
      selectedCategory: null,
      selectedAccount: null,
      selectedPeriodIndex: 0,
      showedPeriod: 2,
      idsOfOpenedCategories: [],
      trnsDate: {
        start: '',
        end: ''
      }
    }
  },

  mounted() {
    document.querySelector('body').addEventListener('click', this.closePopCalendar)
  },

  beforeDestroy() {
    document.querySelector('body').removeEventListener('click', this.closePopCalendar)
  },

  beforeMount() {
    // this.trnsDate.start = this.globalDate.start
    // this.trnsDate.end = this.globalDate.end
    // this.calendar = {
    //   show: false,
    //   range: true,
    //   zero: true
    // value: [
    //   moment(this.globalDate.start).format('Y.M.D').split('.'),
    //   moment(this.globalDate.end).format('Y.M.D').split('.')
    // ]
    // }

    // if (this.isLastDays) {
    //   this.showedDate.first = this.formatDates(this.trnsDate.start, this.trnsDate.end, 'period')
    //   this.showedDate.second = this.formatDates(this.trnsDate.start, this.trnsDate.end, 'date')
    // } else {
    //   this.showedDate.first = this.formatDates(this.trnsDate.start, this.trnsDate.end, 'date')
    //   this.showedDate.second = this.formatDates(this.trnsDate.start, this.trnsDate.end, 'period')
    // }

    this.setDates('isoweek')

    document.addEventListener('keyup', (event) => {
      if (event.keyCode === 27) { // escape key
        this.calendar.show = false
      }
    })
  },

  computed: {
    ...mapGetters(['accounts', 'categories', 'trns', 'getTrns', 'getFilter']),
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
      return this.getFilter.duration
    },
    trnsList() {
      if (this.calendarPreset === 'all') {
        return this.getTrns({
          accountId: this.accountId,
          categoryId: this.categoryId
        })
      } else {
        return this.getTrns({
          startDate: this.trnsDate.start,
          endDate: this.trnsDate.end,
          accountId: this.getFilter.account && this.getFilter.account.id,
          categoryId: this.categoryId
        })
      }
    },
    trnsListHistory() {
      if (this.calendarPreset === 'all') {
        return this.getTrns({
          showTransfers: true,
          accountId: this.accountId,
          categoryId: this.categoryId
        })
      } else {
        return this.getTrns({
          showTransfers: true,
          startDate: this.trnsDate.start,
          endDate: this.trnsDate.end,
          accountId: this.getFilter.account && this.getFilter.account.id,
          categoryId: this.categoryId
        })
      }
    },
    incomesTrns() {
      return this.trnsList.filter(t => t.type === 1)
    },
    expensesTrns() {
      return this.trnsList.filter(t => t.type === 0)
    },
    incomesItemStats() {
      return this.getCategoriesStatFromTrns(this.incomesTrns)
    },
    expensesItemStats() {
      return this.getCategoriesStatFromTrns(this.expensesTrns)
    },
    previousData() {
      const data = []

      let maxCountOfPeriods = this.showedPeriod
      if (this.calendarPreset === 'all') return
      if (this.calendarPreset === 'year') maxCountOfPeriods = 3

      for (let period = 0; period <= maxCountOfPeriods; period++) {
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

        const startDate = moment(periodStartDate).valueOf()
        const endDate = moment(periodEndDate).valueOf()
        const periodTrns = this.getTrns({
          startDate,
          endDate,
          accountId: this.getFilter.account && this.getFilter.account.id,
          categoryId: this.categoryId
        })

        if (periodTrns.length) {
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
          data.push({
            period,
            date: periodName,
            incomes: 0,
            expenses: 0,
            total: 0
          })
        }
      }

      return data
    }
  },

  methods: {
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
    getCategoryStat(categoryId, type) {
      const trnType = type === 'incomes' ? 1 : 0
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
      this.idsOfOpenedCategories = []
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
      this.$store.commit('setFilterDate', {
        first: this.formatDates(this.trnsDate.start, this.trnsDate.end, 'period'),
        second: this.formatDates(this.trnsDate.start, this.trnsDate.end, 'date')
      })

      // Calendar
      this.$store.commit('setFilterCalendar', {
        show: false,
        value: [
          moment(startDate).format('Y.M.D').split('.'),
          moment(endDate).format('Y.M.D').split('.')
        ]
      })

      this.$store.commit('closeLoader')
    },
    selectPeriodStat(index) {
      if (this.selectedPeriodIndex === index) return

      this.idsOfOpenedCategories = []
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

      // Year
      if (this.calendarPreset === 'all') {
        startDate = moment(this.globalDate.start).subtract(index, 'years').startOf('year')
        if (index === 0) endDate = moment(this.globalDate.end).endOf('day')
        else endDate = moment(this.globalDate.end).subtract(index, 'years').endOf('year')
      }

      // Trns
      this.trnsDate.start = startDate
      this.trnsDate.end = endDate

      // Title
      if ((index === 0 || this.calendarPreset) && this.isLastDays) {
        this.$store.commit('setFilterDate', {
          first: this.formatDates(this.trnsDate.start, this.trnsDate.end, 'period'),
          second: this.formatDates(this.trnsDate.start, this.trnsDate.end, 'date')
        })
      } else {
        this.$store.commit('setFilterDate', {
          first: this.formatDates(this.trnsDate.start, this.trnsDate.end, 'date'),
          second: this.formatDates(this.trnsDate.start, this.trnsDate.end, 'period')
        })
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
        this.$store.commit('setFilterDate', {
          first: this.formatDates(this.trnsDate.start, this.trnsDate.end, 'period'),
          second: this.formatDates(this.trnsDate.start, this.trnsDate.end, 'date')
        })
      } else {
        this.$store.commit('setFilterDate', {
          first: this.formatDates(this.trnsDate.start, this.trnsDate.end, 'date'),
          second: this.formatDates(this.trnsDate.start, this.trnsDate.end, 'period')
        })
      }
    },
    clearFilter() {
      this.categoryId = null
      this.selectedCategory = null
      this.idsOfOpenedCategories = []
      this.$store.commit('setAccount', null)
    },
    setFilterAccount(account) {
      if (account) {
        this.$store.commit('setAccount', account)
      } else {
        this.$store.commit('setAccount', null)
      }
    },
    setFilterCategory(categoryId) {
      if (categoryId) {
        const category = this.categories.find(c => c.id === categoryId)
        const childCategories = this.categories.filter(cat => cat.parentId === categoryId)
        if (category) {
          this.categoryId = categoryId
          this.selectedCategory = category
          if (childCategories.length) {
            this.idsOfOpenedCategories = []
            this.idsOfOpenedCategories.push(categoryId)
          }
        }
      } else {
        this.categoryId = null
        this.selectedCategory = null
        this.idsOfOpenedCategories = []
        this.groupedByParent = true
      }
    },
    setDates(period) {
      this.idsOfOpenedCategories = []
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
          duration = 365
          break
        case 'all':
          duration = 365 * 4
          break
      }

      const seletedPeriod = period === 'all' ? 'year' : period

      const startDate = moment().startOf(seletedPeriod).valueOf()
      const endDate = moment().endOf('day').valueOf()

      this.$store.commit('setDuration', duration)
      this.$store.commit('setDates', { start: startDate, end: endDate })
      this.$store.commit('setCalendarPreset', period)

      // Trns
      this.trnsDate.start = startDate
      this.trnsDate.end = endDate

      // Title
      if (period === 'all') {
        this.$store.commit('setFilterDate', {
          first: 'is showed',
          second: 'is showed'
        })
      } else {
        this.$store.commit('setFilterDate', {
          first: this.formatDates(this.trnsDate.start, this.trnsDate.end, 'period'),
          second: this.formatDates(this.trnsDate.start, this.trnsDate.end, 'date')
        })
      }

      // Calendar
      this.$store.commit('setFilterCalendar', {
        show: false,
        value: [
          moment(this.trnsDate.start).format('Y.M.D').split('.'),
          moment(this.trnsDate.end).format('Y.M.D').split('.')
        ]
      })
    },
    shouldOpenCategory(itemId) {
      return this.idsOfOpenedCategories.indexOf(itemId) !== -1
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
                // TODO: change dates
                // default: return `${moment(startDate).format('D MMM YY')} - ${moment(endDate).format('D MMM YY')}`
                default: return `${difference} weeks ago`
              }
            case 'month':
              difference = date.differenceInMonths(this.globalDate.end, startDate)
              switch (difference) {
                case 0: return `This month`
                case 1: return `Last month`
                default: return moment(startDate).format('MMM Y')
              }
            case 'year':
              difference = date.differenceInCalendarYears(this.globalDate.end, startDate)
              switch (difference) {
                case 0: return `This year`
                default: return moment(startDate).format('Y')
              }
            case 'all':
              return moment(startDate).format('Y')
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
      this.$store.commit('setFilterCalendar', {
        show: !this.$store.state.filter.filter.calendar.show,
        left: event.target.closest('.dateTitle__item').offsetLeft,
        top: event.target.closest('.dateTitle__item').offsetTop + 80
      })
    },
    closePopCalendar(event) {
      if (this.$store.state.filter.filter.calendar.show) {
        const link = document.querySelector('.dateTitle__header')
        const target = event.target

        // Clicks inside '.dateTitle__header'
        if (target.contains(link)) {
          this.$store.commit('setFilterDate', { show: false })
        } else {
          this.$store.commit('setFilterDate', { show: false })
        }
      }
    },
    toogleShowTrnsInCategory(categoryId) {
      this.idsOfOpenedCategories.indexOf(categoryId) === -1
        ? this.idsOfOpenedCategories.push(categoryId)
        : this.idsOfOpenedCategories = this.idsOfOpenedCategories.filter(cId => cId !== categoryId)
    },
    changeTab(tab) {
      this.showedTab = tab
      if (tab !== 'alt') {
        this.showedPeriod = 2
      }
    },
    changeTabMoney(tab) {
      this.showedTabMoney = tab
    }
  }
}
</script>

import { mapGetters } from 'vuex'
import moment from 'moment'
import uniqBy from 'lodash/uniqBy'
import orderBy from 'lodash/orderBy'
import date from 'date-fns'
import formatMoney from '../mixins/formatMoney'
import Calendar from './calendar/calendar.vue'
import TrnsList from './TrnsList.vue'
import TrnItem from './TrnItem.vue'
import SummaryShort from './SummaryShort.vue'
import ItemStat from './ItemStat.vue'
import Chart from './Chart.vue'
import Slider from './Slider.vue'

export default {
  name: 'DashboardPage',
  mixins: [formatMoney],
  components: { ItemStat, TrnsList, TrnItem, Calendar, SummaryShort, Chart, Slider },
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
    this.setDates('month')
    this.setDuration(10)
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
    getCategoriesStatFromTrns(trns) {
      if (trns && trns.length > 0) {
        let uniqCategoriesIds = []
        let trnsInCategory = []

        if (this.selectedCategory) {
          uniqCategoriesIds = uniqBy(trns, 'category.id').map(trn => trn.category.id)
        } else {
          uniqCategoriesIds = uniqBy(trns, 'categoryRoot.id').map(trn => trn.categoryRoot.id)
        }

        // Create array of objects with data in categories
        const data = uniqCategoriesIds.map((id) => {
          const category = this.categories.find(c => c.id === id)

          trnsInCategory = trns.filter(trn => {
            return this.selectedCategory ? trn.category.id === id : trn.categoryRoot.id === id
          })

          const total = trnsInCategory.reduce((sum, current) => sum + current.amountRub, 0)

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
      return []
    },
    toogleGroupByParent() {
      this.groupedByParent = !this.groupedByParent
    },
    setDates(period) {
      this.idsOfOpenedCategories = []
      this.selectedPeriodIndex = 0
      this.showedPeriod = 2

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
    setDuration(duration) {
      this.$store.commit('showLoader', 'show')
      this.idsOfOpenedCategories = []
      this.selectedPeriodIndex = 0
      this.showedPeriod = 2

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
      // Calendar
      this.$store.commit('setFilterCalendar', {
        show: false,
        value: [
          moment(startDate).format('Y.M.D').split('.'),
          moment(endDate).format('Y.M.D').split('.')
        ]
      })
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
      this.$store.commit('setFilterAccount', null)
    },
    setFilterAccount(account) {
      if (account) {
        this.$store.commit('setFilterAccount', account)
      } else {
        this.$store.commit('setFilterAccount', null)
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
    formatTrnsForChart(trns) {
      if (trns.length > 0) {
        // Get ids of cats from trns
        const catsIds = uniqBy(trns, 'categoryRoot.id').map(trn => trn.categoryRoot.id)

        // Create data for Chart series
        const data = catsIds.map((id) => {
          const category = this.categories.find(cat => cat.id === id)
          const trnsInCat = trns.filter(trn => trn.categoryRoot.id === id && trn.type === 0)
          const totalInCat = trnsInCat.reduce((sum, current) => sum + current.amountRub, 0)
          return {
            categoryId: id,
            categoryName: category.name,
            category,
            total: totalInCat
          }
        })

        // sort data by biggest value in category
        const dataSorted = data.sort((a, b) => {
          if (a.total > b.total) return -1
          else if (a.total < b.total) return 1
          return 0
        })
        const dataSortedLimited = dataSorted.slice(0, 10)

        return {
          categories: dataSortedLimited.map(d => d.category),
          series: [{
            data: dataSortedLimited.map(d => ({
              categoryName: d.categoryName,
              id: d.categoryId,
              y: d.total,
              color: d.category.color
            }))
          }]
        }
      }

      // If no trns
      return {
        categories: [],
        series: [{
          data: []
        }]
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

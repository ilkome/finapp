import { mapGetters } from 'vuex'
import moment from 'moment'
import uniqBy from 'lodash/uniqBy'
import orderBy from 'lodash/orderBy'
import formatDateForDashboardTitle from '../mixins/formatDateForDashboardTitle'
import formatMoney from '../mixins/formatMoney'
import Calendar from './calendar/calendar.vue'
import TrnsList from './TrnsList.vue'
import TrnItem from './TrnItem.vue'
import SummaryShort from './SummaryShort.vue'
import ItemStatGroup from './ItemStatGroup.vue'
import ItemStat from './ItemStat.vue'
import Chart from './Chart.vue'
import Slider from './Slider.vue'
import AppHeader from './AppHeader.vue'

export default {
  name: 'DashboardPage',
  mixins: [formatMoney],
  components: { ItemStatGroup, ItemStat, TrnsList, TrnItem, Calendar, SummaryShort, Chart, Slider, AppHeader },
  data() {
    return {
      showedHistory: false,
      showedGraph: false,
      accountId: null,
      categoryId: null,
      showedTab: 'alt',
      showedTabMoney: 'expenses',
      selectedCategory: null,
      selectedPeriodIndex: 0,
      showedPeriod: 1,
      idsOfOpenedCategories: [],
      trnsDate: {
        start: '',
        end: ''
      }
    }
  },

  mounted() {
    this.setTimePeriod('month')
  },

  computed: {
    ...mapGetters(['accounts', 'categories', 'getTrns', 'getFilter']),
    $timePeriod() {
      return this.$store.state.dashboard.timePeriod
    },
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
    duration() {
      return this.getFilter.duration
    },
    trnsList() {
      if (this.$timePeriod === 'all') {
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
      if (this.$timePeriod === 'all') {
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
    incomesItemsStat() {
      return this.getCategoriesStatFromTrns(this.incomesTrns)
    },
    expensesItemsStat() {
      return this.getCategoriesStatFromTrns(this.expensesTrns)
    },
    formatTrnsForChart() {
      const newData = []

      for (let period = 0; period < 7; period++) {
        const trns = this.getTrns({
          accountId: this.getFilter.account && this.getFilter.account.id,
          categoryId: this.categoryId })
          .filter(trn =>
            moment(trn.date).startOf('month').valueOf() === moment().startOf('month').subtract(period, 'months').valueOf())

        const incomes = trns
          .filter(trn => trn.type === 1)
          .reduce((sum, current) => sum + current.amountRub, 0)

        const expenses = trns
          .filter(trn => trn.type === 0)
          .reduce((sum, current) => sum + current.amountRub, 0)

        newData.push({
          name: moment().startOf('month').subtract(period, 'months').format('MMM Y'),
          incomes,
          expenses,
          total: incomes - expenses
        })
      }

      return {
        categories: newData.map(d => d.name),
        series: [{
          name: 'Expences',
          color: '#922B21',
          data: newData.map((d, idx) => ({
            y: d.expenses,
            idx
          }))
        }, {
          name: 'Incomes',
          color: '#1e7a45',
          data: newData.map((d, idx) => ({
            y: d.incomes,
            idx
          }))
        }]
        // {
        //   type: 'spline',
        //   name: 'Total',
        //   color: '#7d7d7d',
        //   data: newData.map((d, idx) => ({
        //     y: d.total,
        //     idx
        //   }))
        // }
      }
    }
  },

  methods: {
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
    setTimePeriod(period) {
      this.idsOfOpenedCategories = []
      this.selectedPeriodIndex = 0
      this.showedPeriod = 1

      if (period === 'all') {
        this.$store.commit('setDuration', 0)
        this.$store.commit('timePeriod', 'all')

        // Title
        this.$store.commit('setFilterDate', {
          first: 'All data',
          second: ''
        })

        // Calendar
        this.$store.commit('setFilterCalendar', {
          value: 'all'
        })
      } else {
        const startDate = moment().startOf(period).valueOf()
        const endDate = moment().endOf('day').valueOf()
        const daysDuration = moment(endDate).diff(startDate, 'days') + 1

        this.$store.commit('setDuration', daysDuration)
        this.$store.commit('setDates', { start: startDate, end: endDate })
        this.$store.commit('timePeriod', period)

        // Trns
        this.trnsDate.start = startDate
        this.trnsDate.end = endDate

        // Title
        this.$store.commit('setFilterDate', {
          first: this.formatDates(this.trnsDate.start, this.trnsDate.end, 'period'),
          second: this.formatDates(this.trnsDate.start, this.trnsDate.end, 'date')
        })

        // Calendar
        if (daysDuration <= 31) {
          this.$store.commit('setFilterCalendar', {
            value: [
              moment(this.trnsDate.start).format('Y.M.D').split('.'),
              moment(this.trnsDate.end).format('Y.M.D').split('.')
            ]
          })
        } else {
          this.$store.commit('setFilterCalendar', {
            value: 'all'
          })
        }
      }
    },
    selectPeriodStat(index) {
      // const index = ++this.selectedPeriodIndex
      if (this.selectedPeriodIndex === index) return

      this.idsOfOpenedCategories = []
      this.selectedPeriodIndex = index

      let startDate = moment(this.globalDate.start).subtract(this.duration * index, 'days')
      let endDate = moment(this.globalDate.end).subtract(this.duration * index, 'days')

      // Week
      if (this.$timePeriod === 'isoweek') {
        startDate = moment(this.globalDate.start).subtract(index, 'weeks').startOf('isoweek')
        if (index === 0) endDate = moment(this.globalDate.end).endOf('day')
        else endDate = moment(this.globalDate.start).subtract(index, 'weeks').endOf('isoweek')
      }

      // Month
      if (this.$timePeriod === 'month') {
        startDate = moment(this.globalDate.start).subtract(index, 'months').startOf('month')
        if (index === 0) endDate = moment(this.globalDate.end).endOf('day')
        else endDate = moment(this.globalDate.end).subtract(index, 'months').endOf('month')
      }

      // Year
      if (this.$timePeriod === 'year') {
        startDate = moment(this.globalDate.start).subtract(index, 'years').startOf('year')
        if (index === 0) endDate = moment(this.globalDate.end).endOf('day')
        else endDate = moment(this.globalDate.end).subtract(index, 'years').endOf('year')
      }

      // Year
      if (this.$timePeriod === 'all') {
        startDate = moment(this.globalDate.start).subtract(index, 'years').startOf('year')
        if (index === 0) endDate = moment(this.globalDate.end).endOf('day')
        else endDate = moment(this.globalDate.end).subtract(index, 'years').endOf('year')
      }

      // Trns
      this.trnsDate.start = startDate
      this.trnsDate.end = endDate

      // Title
      if ((index === 0 || this.$timePeriod) && this.isLastDays) {
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
      const duration = endDate.diff(startDate, 'days') + 1
      this.selectedPeriodIndex = 0

      this.$store.commit('setDuration', duration)
      this.$store.commit('setDates', { start: startDate, end: endDate })
      this.$store.commit('timePeriod', null)

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

      // Calendar
      this.$store.commit('setFilterCalendar', {
        show: false,
        value: [
          moment(startDate).format('Y.M.D').split('.'),
          moment(endDate).format('Y.M.D').split('.')
        ]
      })
    },
    setFilterAccount(account) {
      this.$store.commit('setFilterAccount', account)
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
      return formatDateForDashboardTitle(start, end, type, this.$timePeriod, this.globalDate, this.duration)
    },
    closePopCalendar(event) {
      if (this.$store.state.filter.filter.calendar.show) {
        const link = document.querySelector('.header__header')
        const target = event.target

        // Clicks inside '.header__header'
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
    },
    toogleShowGraph() {
      this.showedHistory = false
      this.showedGraph = !this.showedGraph
    },
    toogleShowHistory() {
      this.showedGraph = false
      this.showedHistory = !this.showedHistory
    },
    toogleOpenedCategories() {
      if (this.idsOfOpenedCategories.length) {
        this.idsOfOpenedCategories = []
      } else {
        this.trnsList.map(trn => {
          if (this.idsOfOpenedCategories.indexOf(trn.categoryRoot.id) === -1) {
            this.idsOfOpenedCategories.push(trn.categoryRoot.id)
          }
        })
      }
    },
    selectNextPeriod() {
      const index = this.selectedPeriodIndex + 1
      this.selectPeriodStat(index)
    },
    selectPrevPeriod() {
      const index = this.selectedPeriodIndex - 1
      if (index >= 0) {
        this.selectPeriodStat(index)
      }
    }
  }
}

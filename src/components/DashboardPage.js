import { mapGetters } from 'vuex'
import moment from 'moment'
import uniqBy from 'lodash/uniqBy'
import orderBy from 'lodash/orderBy'
import formatDateForDashboardTitle from '../mixins/formatDateForDashboardTitle'
import checkIsSameDate from '../mixins/checkIsSameDate'
import formatMoney from '../mixins/formatMoney'
import TrnsList from './TrnsList.vue'
import TrnItem from './TrnItem.vue'
import SummaryShort from './SummaryShort.vue'
import ItemStatGroup from './ItemStatGroup.vue'
import ItemStat from './ItemStat.vue'
import Slider from './Slider.vue'
import AppHeader from './AppHeader.vue'
import ChartYears from './ChartYears.vue'

export default {
  name: 'DashboardPage',
  mixins: [formatMoney, checkIsSameDate],
  components: { ItemStatGroup, ItemStat, TrnsList, TrnItem, SummaryShort, Slider, AppHeader, ChartYears },
  data() {
    return {
      showedHistory: false,
      showedGraph: true,
      showedChartYears: false,
      showedTabMoney: 'expenses',
      selectedPeriodIndex: 0,
      showedPeriod: 1,
      idsOfOpenedCategories: [],
      trnsDate: {
        start: '',
        end: ''
      },
      showedPeriodStatic: []
    }
  },

  mounted() {
    this.setTimePeriod('month')
    if (this.$store.state.isMobile) {
      this.showedGraph = false
    }
  },

  computed: {
    ...mapGetters(['accounts', 'categories', 'getTrns', 'getFilter']),
    $timePeriod() {
      return this.$store.state.dashboard.timePeriod
    },
    duration() {
      return this.getFilter.duration
    },
    trnsList() {
      if (this.$timePeriod === 'all') {
        return this.getTrns({
          accountId: this.getFilter.account && this.getFilter.account.id,
          categoryId: this.getFilter.category && this.getFilter.category.id
        })
      } else {
        return this.getTrns({
          startDate: this.trnsDate.start,
          endDate: this.trnsDate.end,
          accountId: this.getFilter.account && this.getFilter.account.id,
          categoryId: this.getFilter.category && this.getFilter.category.id
        })
      }
    },
    trnsListHistory() {
      if (this.$timePeriod === 'all') {
        return this.getTrns({
          showTransfers: true,
          accountId: this.getFilter.account && this.getFilter.account.id,
          categoryId: this.getFilter.category && this.getFilter.category.id
        })
      } else {
        return this.getTrns({
          showTransfers: true,
          startDate: this.trnsDate.start,
          endDate: this.trnsDate.end,
          accountId: this.getFilter.account && this.getFilter.account.id,
          categoryId: this.getFilter.category && this.getFilter.category.id
        })
      }
    },
    incomesItemsStat() {
      return this.getCategoriesStatFromTrns(this.trnsList.filter(t => t.type === 1))
    },
    expensesItemsStat() {
      return this.getCategoriesStatFromTrns(this.trnsList.filter(t => t.type === 0))
    },
    getPeriodStatic() {
      const stat = []
      const periodMax = 6
      const trnsListForSelectedPeriods = this.getTrns({
        accountId: this.getFilter.account && this.getFilter.account.id,
        categoryId: this.getFilter.category && this.getFilter.category.id
      })
        .filter(trn =>
          moment(trn.date).startOf(this.$timePeriod).valueOf() <= moment().startOf(this.$timePeriod).subtract(0, this.$timePeriod).valueOf() &&
          moment(trn.date).startOf(this.$timePeriod).valueOf() >= moment().startOf(this.$timePeriod).subtract(periodMax, this.$timePeriod).valueOf())

      if (trnsListForSelectedPeriods.length) {
        const startDate = moment().startOf(this.$timePeriod)
        const endDate = moment(trnsListForSelectedPeriods[trnsListForSelectedPeriods.length - 1].date).startOf(this.$timePeriod)
        let periodSteps = 0
        periodSteps = startDate.diff(endDate, this.$timePeriod) + 1 // For get 7 in the end

        if (this.$timePeriod !== 'all') {
          for (let period = 0; period < periodSteps; period++) {
            const trns = trnsListForSelectedPeriods
              .filter(trn =>
                moment(trn.date).startOf(this.$timePeriod).valueOf() === moment().startOf(this.$timePeriod).subtract(period, this.$timePeriod).valueOf())
            const incomes = trns
              .filter(trn => trn.type === 1)
              .reduce((sum, current) => sum + current.amountRub, 0)
            const expenses = trns
              .filter(trn => trn.type === 0)
              .reduce((sum, current) => sum + current.amountRub, 0)
            const name = this.formatDateNEW(period)
            const date = moment().startOf(this.$timePeriod).subtract(period, this.$timePeriod).valueOf()
            stat.push({
              date,
              name,
              incomes,
              expenses
            })
          }
          const dataSorted = orderBy(stat, e => e.incomes > e.expenses ? e.incomes : e.expenses, 'desc')
          const biggest = dataSorted[0].incomes > dataSorted[0].expenses ? dataSorted[0].incomes : dataSorted[0].expenses

          return {
            periods: stat,
            biggest
          }
        }
      }
    }
  },

  methods: {
    getPeriodStaticHeight(value, biggest) {
      const height = value / biggest * 100
      let renderHeight
      if (height > 0) {
        renderHeight = height > 1 ? height : 1
      } else {
        renderHeight = 0
      }
      return {
        height: `calc(${renderHeight}%)`
      }
    },
    getPeriodStaticHeight2(value, biggest) {
      const height = value / biggest * 100
      let renderHeight
      if (height > 0) {
        renderHeight = height > 1 ? height : 1
      } else {
        renderHeight = 0
      }
      return `${renderHeight}%`
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
      function kFormatter(num) {
        return num > 999 ? (num / 1000).toFixed() + 'k' : num
      }

      if (trns && trns.length > 0) {
        let uniqCategoriesIds = []
        let trnsInCategory = []

        if (this.getFilter.category) {
          const childCategories = this.categories.filter(cat => cat.parentId === this.getFilter.category.id)
          if (childCategories.length) {
            uniqCategoriesIds = uniqBy(trns, 'categoryRoot.id').map(cat => cat.categoryRoot.id)
          } else {
            uniqCategoriesIds.push(this.getFilter.category.id)
          }
        } else {
          uniqCategoriesIds = uniqBy(trns, 'categoryRoot.id').map(trn => trn.categoryRoot.id)
        }

        // Create array of objects with data in categories
        const data = uniqCategoriesIds.map((id) => {
          const category = this.categories.find(c => c.id === id)

          trnsInCategory = trns.filter(trn => {
            return this.getFilter.category ? this.getFilter.category.id === id : trn.categoryRoot.id === id
          })

          if (trnsInCategory.length) {
            const total = trnsInCategory.reduce((sum, current) => sum + current.amountRub, 0)
            return {
              id,
              category: category,
              name: category.name,
              total,
              totalK: kFormatter(total),
              icon: category.icon,
              color: category.color,
              trns: trnsInCategory
            }
          }
        })
        if (data.length) {
          return orderBy(data, d => d.total, 'desc')
        }
      }
      return []
    },
    shouldOpenCategory(itemId) {
      return this.idsOfOpenedCategories.indexOf(itemId) !== -1
    },
    formatDates(start, end, type) {
      return formatDateForDashboardTitle(start, end)
    },
    formatDateNEW(period) {
      let name
      const difference = moment().diff(moment().subtract(period, this.$timePeriod), this.$timePeriod)

      switch (this.$timePeriod) {
        case 'day':
          switch (difference) {
            // case 0:
            //   name = 'Today'
            //   break
            // case 1:
            //   name = 'Yesterday'
            //   break
            default:
              name = moment().subtract(period, this.$timePeriod).format('D MMM YY')
          }
          break
        case 'week':
          switch (difference) {
            case 0:
              name = `This ${this.$timePeriod}`
              break
            case 1:
              name = `Last  ${this.$timePeriod}`
              break
            default:
              name = `${difference} ${this.$timePeriod} ago`
          }
          break
        case 'month':
          switch (difference) {
            // case 0:
            //   name = `This ${this.$timePeriod}`
            //   break
            default:
              name = moment().subtract(period, this.$timePeriod).format('MMM YY')
          }
          break
        case 'year':
          name = moment().subtract(period, this.$timePeriod).format('Y')
          break
        default:
          name = 'No date'
      }
      return name
    },
    formatDatePeriod(date) {
      let name
      const currentDate = moment().startOf(this.$timePeriod)
      const selectedDate = moment(date).startOf(this.$timePeriod)
      const difference = currentDate.diff(selectedDate, this.$timePeriod)

      switch (this.$timePeriod) {
        case 'day':
          switch (difference) {
            case 0:
              name = 'Today'
              break
            case 1:
              name = 'Yesterday'
              break
            default:
              name = selectedDate.format('D MMM YY')
          }
          break
        case 'week':
          switch (difference) {
            case 0:
              name = `This ${this.$timePeriod}`
              break
            case 1:
              name = `Last  ${this.$timePeriod}`
              break
            default:
              name = `${difference} ${this.$timePeriod} ago`
          }
          break
        case 'month':
          switch (difference) {
            case 0:
              name = `This ${this.$timePeriod}`
              break
            default:
              name = selectedDate.format('MMMM YY')
          }
          break
        case 'year':
          name = selectedDate.format('Y')
          break
        default:
          name = 'No date'
      }
      return name
    },
    toogleShowTrnsInCategory(categoryId) {
      this.idsOfOpenedCategories.indexOf(categoryId) === -1
        ? this.idsOfOpenedCategories.push(categoryId)
        : this.idsOfOpenedCategories = this.idsOfOpenedCategories.filter(cId => cId !== categoryId)
    },
    changeTabMoney(tab) {
      this.showedTabMoney = tab
    },
    toogleShowGraph() {
      this.showedGraph = !this.showedGraph
    },
    toogleShowHistory() {
      this.showedHistory = !this.showedHistory
    },
    toogleShowsChartYears() {
      this.showedChartYears = !this.showedChartYears
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
    setTimePeriod(period) {
      if (!this.getFilter.category) {
        this.idsOfOpenedCategories = []
      }
      this.selectedPeriodIndex = 0
      this.showedPeriod = 1

      if (period === 'all') {
        this.$store.commit('setDuration', 0)
        this.$store.commit('setTimePeriod', 'all')

        // Title
        this.$store.commit('setFilterDate', {
          first: 'All data',
          second: ''
        })
      } else {
        const startDate = moment().startOf(period).valueOf()
        const endDate = moment().endOf('day').valueOf()
        const daysDuration = moment(endDate).diff(startDate, 'days') + 1

        this.$store.commit('setDuration', daysDuration)
        this.$store.commit('setTimePeriod', period)

        // Trns
        this.trnsDate.start = startDate
        this.trnsDate.end = endDate

        // Title
        this.$store.commit('setFilterDate', {
          first: this.formatDatePeriod(startDate),
          second: this.formatDates(this.trnsDate.start, this.trnsDate.end, 'date')
        })
      }
    },
    setDashboardDate(date) {
      const thisMonth = moment().startOf(this.$timePeriod)
      const startDate = moment(date).startOf(this.$timePeriod)
      const endDate = moment(date).endOf(this.$timePeriod)

      if (thisMonth.valueOf() >= startDate.valueOf()) {
        // Trns
        this.trnsDate.start = startDate
        this.trnsDate.end = endDate

        // Title
        this.$store.commit('setFilterDate', {
          first: this.formatDatePeriod(startDate),
          second: this.formatDates(startDate, endDate, 'period')
        })
      }
    },
    setDashboardDateMnoth(date) {
      const thisMonth = moment().startOf('month')
      const startDate = moment(date).startOf('month')
      const endDate = moment(date).endOf('month')

      if (thisMonth.valueOf() >= startDate.valueOf()) {
        // Trns
        this.trnsDate.start = startDate
        this.trnsDate.end = endDate

        // Title
        this.$store.commit('setFilterDate', {
          first: this.formatDatePeriod(startDate),
          second: this.formatDates(startDate, endDate, 'period')
        })
      }
    },
    setFilterAccount(account) {
      this.$store.commit('setFilterAccount', account)
    },
    setFilterCategory(category) {
      if (category) {
        const childCategories = this.categories.filter(cat => cat.parentId === category.id)
        if (category) {
          if (childCategories.length) {
            this.idsOfOpenedCategories = []
            this.idsOfOpenedCategories.push(category.id)
          }
        }
      } else {
        this.idsOfOpenedCategories = []
      }
      this.$store.commit('setFilterCategory', category)
    },
    selectNextPeriod() {
      this.setDashboardDate(moment(this.trnsDate.start).subtract(1, this.$timePeriod))
    },
    selectPrevPeriod() {
      this.setDashboardDate(moment(this.trnsDate.start).add(1, this.$timePeriod))
    }
  }
}

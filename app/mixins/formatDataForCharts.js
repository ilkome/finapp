import { mapGetters } from 'vuex'
import moment from 'moment'
import uniqBy from 'lodash/uniqBy'


const mixin = {
  computed: {
    ...mapGetters(['categories'])
  },

  methods: {
    countTotalTrns(trns) {
      return trns.reduce((sum, current) => sum + current.amountRub, 0)
    },

    getColorByCategory(categoryName) {
      switch (categoryName) {
        case 'Козачка': return '#9b5619'
        case 'Плюшки': return '#007037'
        case 'Питание': return '#6c26b0'
        case 'Авто/Бензин': return '#6D4C41'
        case 'Тинькофф': return '#1c2833'
        default: return '#242424'
      }
    },

    formatDataForChart(trns) {
      return {
        categories: trns.map(d => d.categoryName),
        series: [{
          data: trns.map(d => ({
            y: d.total,
            color: this.getColorByCategory(d.categoryName)
          }))
        }]
      }
    },

    formatDataForPieChart(expenses, incomes) {
      return {
        series: [{
          data: [{
            y: expenses > 0 ? expenses : 0,
            color: '#a73b2f'
          }, {
            y: incomes > 0 ? incomes : 0,
            color: '#1e7a45'
          }]
        }]
      }
    },

    getCategoriesWithTotal(trns) {
      const catsIds = uniqBy(trns, 'categoryName').map(trn => trn.categoryId)
      const data = catsIds.map((id) => {
        const trnsInCat = trns.filter(trn => trn.categoryId === id)
        const totalInCat = trnsInCat.reduce((sum, current) => sum + current.amountRub, 0)
        return {
          categoryName: this.categories.find(c => c.id === id).name,
          total: totalInCat
        }
      })
      // sort data by biggest value in category
      const dataSorted = data.sort((a, b) => {
        if (a.total > b.total) return -1
        else if (a.total < b.total) return 1
        return 0
      })
      return dataSorted
    },

    isSameDay(index) {
      const curDay = moment(this.trnsList[index].date).startOf('day').format()
      if (this.trnsList[index - 1]) {
        const prevDay = moment(this.trnsList[index - 1].date).startOf('day').format()
        if (curDay === prevDay)
          return true
      }
      return false
    }
  }
}

export default mixin

<template lang="pug">
.content
  .module
    h1.title
      | Summary:&nbsp;
      .dropdown
        .dropdown__name(@click="toogleDropdown()")
          template(v-if="duration === 1") Today
          template(v-else) {{ duration }} days
        .dropdown__content(:class="{_visible: showDropdown}")
          template(v-for="day of days")
            a.dropdown__link(@click.prevent="setDuration(day)", :class="{_active: duration === day}") {{ day }}

    SummaryShort(
      :expenses="expensesTotal",
      :incomes="incomesTotal")

  .module._bg
    h1.title.expense._wide Expenses
    .sl
      template(v-for="category in expensesData")
        router-link.itemStat(
          :to="`/categories/${category.id}`",
          title="Перейти в категорию"
        )
          .itemStat__icon: .icon(:class="`icon-${category.id}`"): .icon__pic
          .itemStat__content
            .itemStat__text
              .itemStat__name {{ category.name }}
              .itemStat__price
                template(v-if="getPrevData(category.id, category.total) > 0")
                  div {{ formatMoney(getPrevData(category.id, category.total)) }}
                div {{ formatMoney(category.total) }}
            .itemStat__graph
              .itemStat__graph__in._expense(:style="graphWidth(category.total, geCategoryData(expensesTrns))")

  .module(v-show="incomesData.length > 0")
    h1.title.income._wide Incomes
    .sl
      template(v-for="category in incomesData")
        router-link.itemStat(
          :to="`/categories/${category.id}`",
          title="Перейти в категорию"
        )
          .itemStat__icon: .icon(:class="`icon-${category.id}`"): .icon__pic
          .itemStat__content
            .itemStat__text
              .itemStat__name {{ category.name }}
              .itemStat__price
                template(v-if="getPrevData(category.id, category.total) > 0")
                  div {{ formatMoney(getPrevData(category.id, category.total)) }}
                div {{ formatMoney(category.total) }}
            .itemStat__graph
              .itemStat__graph__in._income(:style="graphWidth(category.total, geCategoryData(incomesTrns))")

  .module._bg
    h1.title._wide._trns Trns list
    TrnsList(:trns="trnsList")
</template>


<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import uniqBy from 'lodash/uniqBy'
import formatMoney from '../mixins/formatMoney'
import SummaryShort from './SummaryShort.vue'
import TrnsList from './TrnsList.vue'

export default {
  mixins: [formatMoney],

  data() {
    return {
      showDropdown: false,
      editTrnId: null,
      days: [1, 3, 5, 10, 15, 30]
    }
  },

  computed: {
    ...mapGetters(['categories', 'trns']),

    duration() {
      return this.$store.state.filter.duration
    },

    fromDate() {
      return moment().subtract(this.duration - 1, 'days').startOf('day').valueOf()
    },

    toDate() {
      return moment().endOf('day').valueOf()
    },

    trnsList() {
      return this.trns
        .filter(trn =>
          trn.categoryId !== 62 && // disable category 'Перевод'
          moment(trn.date) >= this.fromDate &&
          moment(trn.date) <= this.toDate
      )
    },

    expensesTrns() {
      return this.trnsList.filter(trn => trn.type === 0)
    },

    expensesData() {
      return this.geCategoryData(this.expensesTrns)
    },

    expensesTotal() {
      return this.getTotal(this.expensesTrns)
    },

    incomesTrns() {
      return this.trnsList.filter(trn => trn.type === 1)
    },

    incomesData() {
      return this.geCategoryData(this.incomesTrns)
    },

    incomesTotal() {
      return this.getTotal(this.incomesTrns)
    }
  },

  methods: {
    getTotal(trns) {
      if (trns.length > 0) {
        return trns.reduce((sum, current) => sum + current.amountRub, 0)
      }
      return 0
    },

    geCategoryData(trns) {
      if (trns && trns.length > 0) {
        // Create array of categories ids
        const catsIds = uniqBy(trns, 'categoryName').map(trn => trn.categoryId)

        // Create array with categories data
        const data = catsIds.map((id) => {
          const total = trns
            .filter(trn => trn.categoryId === id)
            .reduce((sum, current) => sum + current.amountRub, 0)
          const name = this.categories.find(c => c.id === id).name

          return { id, name, total }
        })

        // Sort array by biggest total value in category
        const dataSorted = data.sort((a, b) => {
          if (a.total > b.total) return -1
          else if (a.total < b.total) return 1
          return 0
        })

        return dataSorted
      }

      return false
    },

    getPrevData(categoryId, prevTotal) {
      const fromDate = moment(this.fromDate).subtract(this.duration, 'days').startOf('day').valueOf()
      const toDate = moment(this.fromDate).subtract(1, 'days').endOf('day').valueOf()
      const trns = this.trns
        .filter(trn =>
          moment(trn.date) >= fromDate &&
          moment(trn.date) <= toDate &&
          trn.categoryId === categoryId)

      const total = trns.reduce((sum, current) => sum + current.amountRub, 0)
      if (total > 0) return total
      return null
    },

    graphWidth(total, trns) {
      const width = total / trns[0].total * 100
      const renderWidth = width > 0 ? width : 0
      return { width: `calc(${renderWidth}%)` }
    },

    toogleDropdown() {
      this.showDropdown = !this.showDropdown
    },

    setDuration(duration) {
      this.showDropdown = false
      this.$store.commit('setDuration', duration)
    }
  },

  components: { SummaryShort, TrnsList }
}
</script>

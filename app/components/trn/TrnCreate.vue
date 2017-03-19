<template lang="pug">
.trnCreate
  h1.panelTitle._sm Создание транзакции

  .table
    .table__cell
      .panel.formPanel
        .amount(:class="(values.type === 1) ? '_income' : '_expense'")
          a.amountCount(@click="setType()")
            .amountCountText
              template(v-if="values.type === 1") +
              template(v-else) -

          .amountValue
            input.amountValueInput(
              v-model.number.lazy="values.amount",
              @keyup.enter="submit",
              type="text" name="amount" placeholder="0")

        .meta
          .metaItem._left(@click="showHideAllCategories()")
            .metaItem__el
              .icon(
                :class="`icon-${values.categoryId}`",
                :title="values.categoryName"
              )
                .icon__pic
            .metaItem__el
              .metaName {{ values.categoryName }}
              .metaItemLabel Категория
              tamplate(v-if="showAllCategories")
                .metaItemDropdown
                  .metaItemDropdown__in
                    a.metaItemDropdown__el(
                      v-for="category in categories",
                      :class="{active: (category.id === values.categoryId)}",
                      @click.prevent="setCategory(category.id)"
                    ) {{ category.name }}

          .metaItem._right(@click="showHideAllAccounts()")
            .metaItem__el
              .metaName(:class="`account-${values.accountId}`",) {{ values.accountName }}
              .metaItemLabel Кошелек
              template(v-if="showAllAccounts")
                .metaItemDropdown
                  .metaItemDropdown__in
                    a.metaItemDropdown__el(
                      v-for="account in accounts",
                      :class="{active: (account.id === values.accountId)}",
                      @click.prevent="setAccoundId(account.id)"
                    ) {{ account.name }}

        .categories
          .icons
            a.icon(
              href="#"
              v-for="trn in lastCategories.slice(0, 10)",
              :class="[{active: (trn.categoryId === values.categoryId)}, `icon-${trn.categoryId}`]",
              :title="trn.categoryName",
              @click.prevent="setCategory(trn.categoryId)")
              .icon__pic

        .desc
          input.input-filter._nomargin(
            v-model.trim="values.description"
            type="text" name="description" placeholder="Описание")

        .action
          transition(name="fade")
            .actionButton(v-if="$store.state.trns.status") {{ $store.state.trns.status }}
            .actionButton(v-else @click.prevent="submit") Создать

      .infoTable
        .infoTable__cell
          .accountDetails._small
            .accountContentItem
              .accountContentItemLabel Рассход
              .accountContentItemTotal.expense
                div {{ formatMoney(expensesTotal) }}
            .accountContentItem
              .accountContentItemLabel Приход
              .accountContentItemTotal.income
                div {{ formatMoney(incomesTotal) }}
            .accountContentItem
              .accountContentItemLabel Итого
              .accountContentItemTotal
                .accountContentItemTotalIn.sum
                  div {{ formatMoney(incomesTotal - expensesTotal) }}

        .infoTable__pie
          Chart(chartType="pie", :data="pieDataChart")

    .table__cell
      h2.panelTitle._sm Транзакции
      template(v-for="trn in trnsList")
        TrnItem(:trn="trn", :key="trn.id")

  template(v-if="trnsList.length")
    .panelCol
      template(v-if="expensesDataChart")
        .panel
          h2.panelTitle Рассходы
          .panelChart
            Chart(:data="expensesDataChart")

      template(v-if="incomesDataChart")
        .panel
          h2.panelTitle Поступления
          .panelChart
            Chart(:data="incomesDataChart")
</template>


<script>
import moment from 'moment'
import uniqBy from 'lodash/uniqBy'
import { mapGetters } from 'vuex'
import formatMoney from '../../mixins/formatMoney'
import formatDataForCharts from '../../mixins/formatDataForCharts'
import TrnItem from './TrnItem.vue'
import Chart from '../chart/Chart.vue'

export default {
  mixins: [formatMoney, formatDataForCharts],

  data() {
    const lastTrn = this.$store.getters.trns[0]
    return {
      editingDate: false,
      tempDate: '',
      showAllCategories: false,
      showAllAccounts: false,
      values: {
        accountId: lastTrn.accountId,
        accountName: lastTrn.accountName,
        amount: '',
        categoryId: lastTrn.categoryId,
        categoryName: lastTrn.categoryName,
        type: 0,
        currency: lastTrn.currency,
        description: ''
      }
    }
  },

  computed: {
    ...mapGetters(['trns', 'accounts', 'categories']),
    date() {
      return this.$store.state.filter.date
    },
    dateChart() {
      return {
        start: moment(this.$store.state.filter.date).format('DD.MM.YY'),
        end: moment(this.$store.state.filter.date).format('DD.MM.YY')
      }
    },
    trnsList() {
      const trnsInThisDay = this.$store.getters.trns
        .filter(t => moment(t.date).format('D.MM.YY') === moment(this.date).format('D.MM.YY'))
      return trnsInThisDay
    },
    lastCategories() {
      return uniqBy(this.trns, 'categoryName').slice(0, 100)
    },

    incomesTrns() {
      return this.trnsList.filter(trn => trn.type === 1)
    },

    incomesTotal() {
      return this.countTotalTrns(this.incomesTrns)
    },

    expensesTrns() {
      return this.trnsList.filter(trn => trn.type === 0)
    },

    expensesTotal() {
      return this.countTotalTrns(this.expensesTrns)
    },

    pieDataChart() {
      return this.formatDataForPieChart(this.expensesTotal, this.incomesTotal)
    },

    // Incomes data
    incomesDataChart() {
      if (this.incomesTrns.length > 0) {
        const incomesDataSorted = this.dataInCategory(this.incomesTrns)
        return this.formatDataForChart(incomesDataSorted)
      }
      return false
    },

    // Expenses data
    expensesDataChart() {
      if (this.expensesTrns.length > 0) {
        const expensesDataSorted = this.dataInCategory(this.expensesTrns)
        return this.formatDataForChart(expensesDataSorted)
      }
      return false
    },
  },

  methods: {
    showHideAllCategories() {
      this.showAllCategories = !this.showAllCategories
    },

    showHideAllAccounts() {
      this.showAllAccounts = !this.showAllAccounts
    },

    setNextPrevDate(way) {
      this.$store.dispatch('setNextPrevDate', way)
    },

    showDateSelector() {
      this.editingDate = true
      this.tempDate = moment(this.date).format('D.MM.YY')
    },

    hideDateSelector() {
      this.editingDate = false
    },

    setDate() {
      this.editingDate = false
      this.date = moment(this.tempDate, 'D.MM.YY')
    },

    setCategory(categoryId) {
      this.values.categoryId = categoryId
      this.values.categoryName = this.categories.find(category => category.id === categoryId).name
    },

    setType() {
      this.values.type = (this.values.type === 1) ? 0 : 1
    },

    setAccoundId(accountId) {
      this.values.accountId = accountId
      this.values.currency = this.accounts.find(account => account.id === accountId).currency
      this.values.accountName = this.accounts.find(account => account.id === accountId).name
      this.showAllAccounts = false
    },

    submit() {
      const time = moment().format('HH:mm:ss')
      const day = moment(this.date).format('D.MM.YY')
      const date = moment(`${day} ${time}`, 'D.MM.YY HH:mm:ss').valueOf()
      const values = {
        ...this.values,
        date
      }
      this.$store.dispatch('addTrn', values)
      this.values.amount = ''
      this.values.description = ''
    }
  },

  components: { TrnItem, Chart }
}
</script>

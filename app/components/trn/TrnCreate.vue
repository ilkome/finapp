<template lang="pug">
.trnCreate
  h1.panelTitle._sm Создание транзакции
  .panel
    .amount(:class="(values.type === 1) ? '_income' : '_expense'")
      a.amountCount(
        @click="setType()",
      )
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
        .metaName {{ values.categoryName }}
        .metaItemLabel Категория

      .metaItem._right(@click="showHideAllAccounts()")
        .metaName {{ values.accountName }}
        .metaItemLabel Кошелек
        template(v-if="showAllAccounts")
          .metaItemDropdown
            a.link(href="#"
              v-for="account in accounts",
              :class="{active: (account.id === values.accountId)}",
              @click.prevent="setAccoundId(account.id)"
            ) {{ account.name }}

    .categories
      .meta(v-if="showAllCategories")
        select(v-model="values.categoryId")
          option(v-for="category in categories", :value="category.id") {{ category.name }}

      .icons
        a.icon(
          href="#"
          v-for="trn in lastCategories.slice(0, 10)",
          :class="[{active: (trn.categoryId === values.categoryId)}, `icon-${trn.categoryId}`]",
          :title="trn.categoryName",
          @click.prevent="setCategory(trn.categoryId)")
          .icon__pic

        template(v-if="showAllCategories")
          transition(name="fade" v-for="trn in lastCategories.slice(10)")
            a.icon(
              href="#",
              :class="[{active: (trn.categoryId === values.categoryId)}, `icon-${trn.categoryId}`]",
              :title="trn.categoryName",
              @click.prevent="setCategory(trn.categoryId)")
              .icon__pic

    .desc
      input.descInput(
        v-model.trim="values.description"
        type="text" name="description" placeholder="Описание")

    .action
      transition(name="fade")
        .actionButton(v-if="$store.state.trns.status") {{ $store.state.trns.status }}
        .actionButton(v-else @click.prevent="submit") Создать

  //- .div
  //-   .div
  //-     h3.panelTitle Транзакции
  //-     .panel__title-nav
  //-       .panel__title-nav__left(@click.prevent="setNextPrevDate('prev')")
  //-       .panel__title-nav__date(@click.prevent="showDateSelector()")
  //-         template(v-if="editingDate")
  //-           input(
  //-             v-model.trim="tempDate"
  //-             @keyup.esc="hideDateSelector()"
  //-             @keyup.enter="setDate()"
  //-             type="text" name="date" placeholder="31.12.2017").input.date
  //-         div(v-else) {{ date | date }}
  //-       .panel__title-nav__right(@click.prevent="setNextPrevDate('next')")
  //-
  //- template(v-if="trnsBySelectedDate.length")
  //-   TrnItem(
  //-     v-for="(trn, index) in trnsBySelectedDate",
  //-     :trns="trnsBySelectedDate", :trn="trn", :index="index", :key="trn.id")
  //-
  //- template(v-else)
  //-   div Нет транзакций за эту дату

  //- ChartByDate
  ChartByDate(:date="dateChart")
</template>


<script>
import moment from 'moment'
import _ from 'lodash'
import { mapGetters } from 'vuex'
import formatMoney from '../../mixins/money'
import TrnItem from './TrnItem.vue'
import ChartByDate from '../chart/ChartByDate.vue'

export default {
  mixins: [formatMoney],

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
    trnsBySelectedDate() {
      const trnsInThisDay = this.$store.getters.trns
        .filter(t => moment(t.date).format('D.MM.YY') === moment(this.date).format('D.MM.YY'))
      return trnsInThisDay
    },
    lastCategories() {
      return _.uniqBy(this.trns, 'categoryName').slice(0, 100)
    }
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

  components: { TrnItem, ChartByDate }
}
</script>


<style lang="stylus" scoped>
  @import "../../stylus/components"
  @import "styles/form"
</style>

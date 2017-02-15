<template lang="pug">
div
  .table2
    .table__cell
      .module
        h1.module__title Создание транзакции
        .module__content
          form.ui.form
            .field.inline
              input(
                v-model.trim="values.amount",
                @keyup.enter="submit"
                type="text" name="amount" placeholder="0")
              label Сумма

            .field.inline
              label.radio
                input(type="radio" value="0" v-model="values.type").radio__value
                .radio__label Рассход

              label.radio
                input(type="radio" value="1" v-model="values.type").radio__value
                .radio__label Приход

            .field
              label Кошелек
              a(href="#" class="link"
                v-for="account in accounts",
                @click="setAccoundId(account.id)",
                :class="{active: (account.id === values.accountId)}"
              ) {{ account.name }}

            .field
              label Категория
              .icons
                a.icon(
                  href="#"
                  v-for="trn in trns.slice(0, 8)",
                  :class="`icon-${trn.categoryId}`",
                  @click="setCategory(trn.categoryId)",
                  :title="trn.categoryName"
                )
                  .icon__pic

              select.ui.fluid.dropdown(v-model="values.categoryId")
                option(v-for="category in categories", :value="category.id") {{ category.name }}

            .field.inline
              input(
                v-model.trim="values.description"
                type="text" name="description" placeholder="")
              label Описание

            transition(name="fade")
              .ui.button.disabled(v-if="$store.state.trns.status") {{ $store.state.trns.status }}
              .ui.button(v-else @click="submit") Создать
    //- table__cell

    .table__cell
      .module
        .module__title
          .panel__title
            h3.panel__title-name(@click="updateList()") Транзакции
            .panel__title-nav
              .panel__title-nav__left(@click="setNextPrevDate('prev')")
              .panel__title-nav__date(@click="showDateSelector()")
                template(v-if="editingDate")
                  input(
                    v-model.trim="tempDate"
                    @keyup.esc="hideDateSelector()"
                    @keyup.enter="setDate()"
                    type="text" name="date" placeholder="31.12.2017").input.date
                div(v-else) {{ date | date }}
              .panel__title-nav__right(@click="setNextPrevDate('next')")

        .module__content
          template(v-if="trnsBySelectedDate.length")
            TrnItem(v-for="trn in trnsBySelectedDate", :trn="trn", :key="trn.id")

          template(v-else)
            div Нет транзакций за эту дату


</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import formatMoney from '../../mixins/money'
import TrnItem from './TrnItem'

export default {
  mixins: [formatMoney],

  data() {
    const lastTrn = this.$store.getters.trns[0]
    return {
      editingDate: false,
      date: moment(),
      tempDate: '',
      values: {
        accountId: lastTrn.accountId,
        amount: '',
        categoryId: lastTrn.categoryId,
        type: 0,
        currency: lastTrn.currency,
        description: ''
      }
    }
  },

  computed: {
    ...mapGetters(['trns', 'accounts', 'categories']),
    trnsBySelectedDate() {
      return this.$store.getters.trns.filter(t =>
        moment(t.date).format('D.MM.YY') === moment(this.date).format('D.MM.YY'))
    }
  },

  methods: {
    setNextPrevDate(way) {
      if (way === 'prev') this.date = moment(this.date).subtract(1, 'days')
      if (way === 'next') this.date = moment(this.date).add(1, 'days')
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
    },

    setAccoundId(accountId) {
      this.values.accountId = accountId
      this.values.currency = this.accounts.find(account => account.id === accountId).currency
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

  components: { TrnItem }
}
</script>

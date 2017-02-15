<template lang="pug">
div
  .table2
    .table__cell
      .module
        h1.module__title Редактирование транзакции
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
                  :title="trn.categoryName+trn.id"
                )
                  .icon__pic

              select.ui.fluid.dropdown(v-model="values.categoryId")
                option(v-for="category in categories", :value="category.id") {{ category.name }}

            .field.inline
              input(
                v-model.trim="values.description"
                type="text" name="description" placeholder="")
              label Описание

            input(
              v-model.trim="date"
              @keyup.esc="hideDateSelector()"
              @keyup.enter="setDate()"
              type="text" name="date" placeholder="31.12.2017").input.date

            transition(name="fade")
              .ui.button.disabled(v-if="$store.state.trns.status") {{ $store.state.trns.status }}
              .ui.button(v-else @click="submit") Создать
    //- table__cell

    .table__cell
      .module
        h1.module__title Редактирование транзакции
        .module__content
          .items.inline
            .item
              .icon(:class="`icon-${trn.categoryId}`")
                .icon__pic
            .item.right.aligned
              div(:class="trn.type === 1 ? 'income' : 'expense'") {{ formatMoney(trn.amount) }}
              div {{ trn.date | date }}
            .item
              div {{ trn.categoryName }}
              div {{ trn.accountName }}
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import formatMoney from '../../mixins/money'

export default {
  mixins: [formatMoney],

  data() {
    const trn = this.$store.getters.trns.find(t => t.id === +this.$route.params.id)
    return {
      date: moment(trn.date).format('D.MM.YY'),
      values: {
        ...trn,
        accountId: trn.accountId,
        amount: trn.amount,
        categoryId: trn.categoryId,
        type: trn.type,
        currency: trn.currency,
        description: trn.description
      }
    }
  },

  computed: {
    ...mapGetters(['trns', 'accounts', 'categories']),
    trn() {
      return this.$store.getters.trns.find(t => t.id === +this.$route.params.id)
    },
  },

  methods: {
    setCategory(categoryId) {
      this.values.categoryId = categoryId
    },

    setAccoundId(accountId) {
      this.values.accountId = accountId
      this.values.currency = this.accounts.find(account => account.id === accountId).currency
    },

    submit() {
      const time = moment().format('HH:mm:ss')
      const day = moment(this.date, 'D.MM.YY').format('D.MM.YY')
      const date = moment(`${day} ${time}`, 'D.MM.YY HH:mm:ss').valueOf()
      const values = {
        ...this.values,
        date
      }
      this.$store.dispatch('updateTrn', values)
    }
  }
}
</script>

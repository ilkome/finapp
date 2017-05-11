<template lang="pug">
div
  h1.title Edit trn
  .table
    .table__cell
      .panel
        .amount(:class="(values.type === 1) ? '_income' : '_expense'")
          a.amountCount(@click="setAccountType()")
            .amountCountText
              template(v-if="values.type === 1") +
              template(v-else) -

          .amountValue
            input.amountValueInput(
              v-model.lazy="values.amount",
              @keyup.enter="addTrn",
              type="text" name="amount" placeholder="0")

        .meta
          .metaItem._left(@click.prevent.stop="toogleCategoriesDropdown()")
            .metaItem__el
              .icon(
                :class="`icon-${values.categoryId}`",
                :title="values.categoryName"
              )
                .icon__pic
            .metaItem__el
              .metaName {{ values.categoryName }}
              .metaItemLabel Категория
              .metaItemDropdown(v-if="show.categories")
                .metaItemDropdown__in
                  a.metaItemDropdown__el(
                    v-for="category in categories",
                    :class="{active: (category.id === values.categoryId)}",
                    @click.prevent="setCategory(category.id)"
                  )
                    .table._center
                      .table__cell
                        .icon(:class="`icon-${category.id}`", :title="category.name"): .icon__pic
                      .table__cell._grow {{ category.name }}

          .metaItem._right(@click.prevent.stop="toogleAccountsDropdown()")
            .metaItem__el
              .metaName(:class="`account-${values.accountId}`",) {{ values.accountName }}
              .metaItemLabel Кошелек
              template(v-if="show.accounts")
                .metaItemDropdown
                  .metaItemDropdown__in
                    a.metaItemDropdown__el(
                      v-for="account in accounts",
                      :class="{active: (account.id === values.accountId)}",
                      @click.prevent.stop="setAccoundId(account.id)"
                    ) {{ account.name }}

        .categories
          .categoriesIcons
            .categoriesIcons__el(v-for="trn in lastCategories")
              a.icon(
                :class="[{active: (trn.categoryId === values.categoryId)}, `icon-${trn.categoryId}`]",
                :title="trn.categoryName",
                @click.prevent="setCategory(trn.categoryId)"
              )
                .icon__pic

        .desc
          input.input-filter._nomargin(
            v-model.trim="values.description"
            type="text" name="description" placeholder="Описание")

        .desc
          input(
            v-model.trim="date"
            @keyup.esc="hideDateSelector()"
            @keyup.enter="setDate()"
            type="text" name="date" placeholder="31.12.2017").amountValueInput


        .action
          .actionButton(v-if="$store.state.trns.status") {{ $store.state.trns.status }}
          .actionButton(v-else @click.prevent="submit") Обновить

    .table__cell
      TrnItem(:trn="trn")
</template>


<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import TrnItem from './TrnItem'
import formatMoney from '../mixins/formatMoney'

export default {
  mixins: [formatMoney],

  data() {
    const trn = this.$store.getters.trns.find(t => t.id === +this.$route.params.id)
    return {
      date: moment(trn.date).format('D.MM.YY'),
      rootEl: document.querySelector('.app'),
      show: {
        accounts: false,
        categories: false
      },
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
    toogleCategoriesDropdown() {
      this.show.accounts = false
      this.show.categories = !this.show.categories
    },

    toogleAccountsDropdown() {
      this.show.categories = false
      this.show.accounts = !this.show.accounts
    },

    lastCategories() {
      return uniqBy(this.trns, 'categoryName').slice(0, 10)
    },

    setCategory(categoryId) {
      this.values.categoryId = categoryId
      this.values.categoryName = this.categories.find(category => category.id === categoryId).name
    },

    setAccountType() {
      this.values.type = (this.values.type === 1) ? 0 : 1
    },

    setAccoundId(accountId) {
      this.values.accountId = accountId
      this.values.currency = this.accounts.find(account => account.id === accountId).currency
      this.values.accountName = this.accounts.find(account => account.id === accountId).name
      this.show.accounts = false
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
  },

  components: {TrnItem}
}
</script>

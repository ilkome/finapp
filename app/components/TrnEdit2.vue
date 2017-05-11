<template lang="pug">
.trnForm
  .amount(:class="(values.type === 1) ? '_income' : '_expense'")
    a.amountCount(@click="setAccountType()")
      .amountCountText
        template(v-if="values.type === 1") +
        template(v-else) -

    .amountValue
      input.amountValueInput(
        v-model.lazy="values.amount",
        @keyup.enter="submit",
        type="text" name="amount" placeholder="0")

  .filter
    .link(@click="setNextPrevDate('prev')")
      .fa.fa-chevron-left
    .filterItem._date
      .fa.fa-clock-o
      .filterItemDate {{ date | date }}
    .link(@click="setNextPrevDate('next')")
      .fa.fa-chevron-right

  .meta
    .metaItem._left(@click.prevent.stop="toogleCategoriesDropdown()", :class="{_active: show.categories}")
      .metaItem__el
        .icon(
          :class="`icon-${values.categoryId}`",
          :title="values.categoryName"
        )
          .icon__pic
      .metaItem__el
        .metaItemLabel Категория
        .metaName {{ values.categoryName }}
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

    .metaItem._right(@click.prevent.stop="toogleAccountsDropdown()", :class="{_active: show.accounts}")
      .metaItem__el
        .icon(:class="`bg-${values.accountId}`")
      .metaItem__el
        .metaItemLabel Кошелек
        .metaName() {{ values.accountName }}
        template(v-if="show.accounts")
          .metaItemDropdown
            .metaItemDropdown__in
              a.metaItemDropdown__el(
                v-for="account in accounts",
                :class="{active: (account.id === values.accountId)}",
                @click.prevent.stop="setAccound(account.id)"
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

  .action
    .actionButton._disable(v-if="$store.state.trns.status") {{ $store.state.trns.status }}
    .actionButton(v-else @click.prevent="submit") Обновить
</template>


<script>
import moment from 'moment'
import uniqBy from 'lodash/uniqBy'
import { mapGetters } from 'vuex'
import TrnItem from './TrnItem'
import formatMoney from '../mixins/formatMoney'

export default {
  mixins: [formatMoney],

  props: {
    trn: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      date: moment(this.trn.date),
      rootEl: document.querySelector('.app'),
      show: {
        accounts: false,
        categories: false
      },
      values: {
        ...this.trn,
        accountId: this.trn.accountId,
        amount: this.trn.amount,
        categoryId: this.trn.categoryId,
        type: this.trn.type,
        currency: this.trn.currency,
        description: this.trn.description
      }
    }
  },

  computed: {
    ...mapGetters(['trns', 'accounts', 'categories']),
    lastCategories() {
      return uniqBy(this.trns, 'categoryName').slice(0, 30)
    }
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

    setCategory(categoryId) {
      this.values.categoryId = categoryId
      this.values.categoryName = this.categories.find(category => category.id === categoryId).name
    },

    setAccountType() {
      this.values.type = (this.values.type === 1) ? 0 : 1
    },

    setAccound(accountId) {
      this.values.accountId = accountId
      this.values.currency = this.accounts.find(account => account.id === accountId).currency
      this.values.accountName = this.accounts.find(account => account.id === accountId).name
      this.show.accounts = false
    },

    setNextPrevDate(way) {
      let date
      if (way === 'prev') date = moment(this.date).subtract(1, 'days')
      if (way === 'next') date = moment(this.date).add(1, 'days')
      this.date = date
    },

    submit() {
      const date = moment(this.date).valueOf()
      const values = {
        ...this.values,
        date
      }
      this.$store.dispatch('updateTrn', values)
    }
  },

  components: { TrnItem }
}
</script>

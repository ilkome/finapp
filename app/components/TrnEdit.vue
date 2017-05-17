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
    .selectItem(:class="{_active: show.categories}")
      .selectItem__head(@click.prevent.stop="toogleCategoriesDropdown()")
        .selectItem__icon
          .icon(
            :class="`icon-${values.categoryId}`",
            :title="values.categoryName"): .icon__pic
        .selectItem__el
          .selectItem__label Category
          .selectItem__name {{ values.categoryName }}
      .selectItem__dropdown(v-show="show.categories")
        input(type="text", v-model.trim="filter", :placeholder="values.categoryName" v-focus="show.categories").selectItem__dropdown__filter
        .selectItem__dropdown__in
          a.selectItem__dropdown__el(
            v-for="category in categoriesList",
            :class="{active: (category.id === values.categoryId)}",
            @click.prevent="setCategory(category.id)"
          )
            .selectItem__dropdown__el__pic
              .icon(:class="`icon-${category.id}`", :title="category.name"): .icon__pic
            .selectItem__dropdown__el__name {{ category.name }}

    .selectItem(:class="{_active: show.accounts}")
      .selectItem__head(@click.prevent.stop="toogleAccountsDropdown()")
        .selectItem__icon
          .icon(:class="`bg-${values.accountId}`")
        .selectItem__el
          .selectItem__label Account
          .selectItem__name {{ values.accountName }}
      .selectItem__dropdown(v-show="show.accounts")
        .selectItem__dropdown__in
          a.selectItem__dropdown__el(
            v-for="account in accounts",
            :class="{active: (account.id === values.accountId)}",
            @click.prevent="setAccound(account.id)"
          )
            .selectItem__dropdown__el__pic
              .icon(:class="`bg-${account.id}`")
            .selectItem__dropdown__el__name {{ account.name }}

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
import { focus } from 'vue-focus'
import TrnItem from './TrnItem'
import formatMoney from '../mixins/formatMoney'

export default {
  mixins: [formatMoney],
  directives: { focus: focus },

  props: {
    trn: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      date: moment(this.trn.date),
      filter: '',
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

    categoriesList() {
      return this.categories.filter(category =>
        category.name.toLowerCase().search(this.filter.toLowerCase()) !== -1)
    },

    lastCategories() {
      return uniqBy(this.trns, 'categoryName').slice(0, 30)
    }
  },

  methods: {
    closeDropdown() {
      return () => {
        this.show.accounts = false
        this.show.categories = false
      }
    },

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
      this.show.categories = false
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

  mounted() {
    this.rootEl.addEventListener('click', this.closeDropdown())
  },

  beforeDestroy() {
    this.rootEl.removeEventListener('click', this.closeDropdown())
  },

  components: { TrnItem }
}
</script>

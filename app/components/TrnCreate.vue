<template lang="pug">
.panel._clean
  h2.title Create trn
  .panel__loader(:class="{_visible: loading}"): .fa.fa-spinner

  .amount(:class="(values.type === 1) ? '_income' : '_expense'")
    a.amountCount(@click="setTrnType()")
      .amountCountText
        template(v-if="values.type === 1") +
        template(v-else) -

    .amountValue
      input.amountValueInput(
        v-model.lazy="values.amount",
        @keyup.enter="addTrn",
        type="text" name="amount" placeholder="0")

  .filter
    .link(@click="setNextPrevDate('prev')")
      .fa.fa-chevron-left
    .filterItem._date
      .fa.fa-clock-o
      .filterItemDate {{ date | date }}
    .link(@click="setNextPrevDate('next')")
      .fa.fa-chevron-right

  template(v-if="lastCategories.length > 1")
    .formCategories
      .categoriesIcons
        .categoriesIcons__el(v-for="trn in lastCategories")
          a.icon(
            :class="[{_active: (trn.categoryId === values.categoryId)}, `icon-${trn.categoryId}`]",
            :title="trn.categoryName",
            @click.prevent="setCategory(trn.categoryId)")
            .icon__pic

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

  .desc
    input.input-filter._nomargin(
      v-model.trim="values.description"
      type="text" name="description" placeholder="Description")

  .action
    .actionButton(v-if="$store.state.trns.status") {{ $store.state.trns.status }}
    .actionButton(v-else @click.prevent="addTrn") Create trn
</template>


<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import uniqBy from 'lodash/uniqBy'
import { focus } from 'vue-focus'

export default {
  directives: { focus: focus },

  props: {
    account: {
      type: Object
    }
  },

  watch: {
    '$route' (to, from) {
      if (this.$route.params.id) {
        const accountId = +this.$route.params.id
        this.setAccound(accountId)
      }
    }
  },

  data() {
    let lastTrn = this.$store.getters.trns[0]
    if (!lastTrn) {
      lastTrn = {
        accountId: '',
        accountName: ''
      }
    }

    return {
      focused: false,
      date: moment(),
      filter: '',
      errors: null,
      loading: false,
      rootEl: document.querySelector('.app'),
      show: {
        accounts: false,
        categories: false
      },
      values: {
        accountId: this.account ? this.account.id : lastTrn.accountId,
        accountName: this.account ? this.account.name : lastTrn.accountName,
        amount: null,
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

    categoriesList() {
      return this.categories.filter(category =>
        category.name.toLowerCase().search(this.filter.toLowerCase()) !== -1)
    },

    lastCategories() {
      return uniqBy(this.trns, 'categoryName').slice(0, 24)
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
      this.show.categories = false
    },

    setTrnType() {
      this.values.type = (this.values.type === 1) ? 0 : 1
    },

    setAccound(accountId) {
      const account = this.accounts.find(account => account.id === accountId)
      if (account) {
        this.values.accountId = accountId
        this.values.currency = this.accounts.find(account => account.id === accountId).currency
        this.values.accountName = this.accounts.find(account => account.id === accountId).name
        this.show.accounts = false
      }
    },

    setNextPrevDate(way) {
      let date
      if (way === 'prev') date = moment(this.date).subtract(1, 'days')
      if (way === 'next') date = moment(this.date).add(1, 'days')
      this.date = date
    },

    async addTrn() {
      console.group('TrnCreate: addTrn')
      this.$store.commit('showLoader')
      const time = moment().format('HH:mm:ss')
      const day = moment(this.date).format('D.MM.YY')
      const date = moment(`${day} ${time}`, 'D.MM.YY HH:mm:ss').valueOf()

      let values = {}

      if (!this.values.amount) {
        this.errors = 'Пусто'
        this.loading = false
        return false
      } else {
        // Number
        if (+this.values.amount > 0) {
          this.errors = 'Меньше нуля'
          values = {
            ...this.values,
            amount: +this.values.amount,
            date
          }
        } else {
          // Array
          const amountsArray = this.values.amount.split(',')
          values = []
          for (const value of amountsArray) {
            if (+value.trim() > 0) {
              values.push({
                ...this.values,
                amount: +value.trim(),
                date
              })
            } else {
              this.errors = 'Есть ошибки в списке'
            }
          }
        }
      }

      const result = await this.$store.dispatch('addTrn', values)

      if (result) {
        this.values.amount = ''
        this.values.description = ''
        this.filter = ''
        this.loading = false
        this.$store.commit('disableLoader')
      }
      console.groupEnd()
    },

    closeDropdown() {
      return () => {
        this.show.accounts = false
        this.show.categories = false
      }
    }
  },

  mounted() {
    this.rootEl.addEventListener('click', this.closeDropdown())
  },

  beforeDestroy() {
    this.rootEl.removeEventListener('click', this.closeDropdown())
  }
}
</script>

<template lang="pug">
  .panel.formPanel
    h2.title Создание транзакции
    .panel__loader(:class="{_visible: loading}"): .fa.fa-spinner

    .amount(:class="(values.type === 1) ? '_income' : '_expense'")
      a.amountCount(@click="setAccountType()")
        .amountCountText
          template(v-if="values.type === 1") +
          template(v-else) -

      .amountValue
        input.amountValueInput(
          v-model.number.lazy="values.amount",
          @keyup.enter="submit",
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
          template(v-if="show.categories")
            .metaItemDropdown
              .metaItemDropdown__in
                a.metaItemDropdown__el(
                  v-for="category in categories",
                  :class="{active: (category.id === values.categoryId)}",
                  @click.prevent="setCategory(category.id)"
                ) {{ category.name }}

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
      .actionButton(v-if="$store.state.trns.status") {{ $store.state.trns.status }}
      .actionButton(v-else @click.prevent="addTrn") Создать
</template>


<script>
import moment from 'moment'
import uniqBy from 'lodash/uniqBy'
import { mapGetters } from 'vuex'

export default {
  data() {
    const lastTrn = this.$store.getters.trns[0]
    return {
      loading: false,
      rootEl: document.querySelector('.app'),
      show: {
        accounts: false,
        categories: false
      },
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
    trnsList() {
      const trnsInThisDay = this.$store.getters.trns
        .filter(t => moment(t.date).format('D.MM.YY') === moment(this.date).format('D.MM.YY'))
      return trnsInThisDay
    },
    lastCategories() {
      return uniqBy(this.trns, 'categoryName').slice(0, 100)
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

    setAccoundId(accountId) {
      this.values.accountId = accountId
      this.values.currency = this.accounts.find(account => account.id === accountId).currency
      this.values.accountName = this.accounts.find(account => account.id === accountId).name
      this.show.accounts = false
    },

    async addTrn() {
      this.loading = true
      const time = moment().format('HH:mm:ss')
      const day = moment(this.date).format('D.MM.YY')
      const date = moment(`${day} ${time}`, 'D.MM.YY HH:mm:ss').valueOf()
      const values = {
        ...this.values,
        date
      }
      await this.$store.dispatch('addTrn', values)
      this.values.amount = ''
      this.values.description = ''
      this.loading = false
    },

    closeDropdown() {
      return () => {
        console.log('click')
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

<template lang="pug">
  .panel._limitWidth
    h2.title Создание транзакции
    .panel__loader(:class="{_visible: loading}"): .fa.fa-spinner

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

    pre {{errors}}
    .action
      .actionButton(v-if="$store.state.trns.status") {{ $store.state.trns.status }}
      .actionButton(v-else @click.prevent="addTrn") Создать
</template>


<script>
import jQuery from 'jquery'
import toastr from 'toastr'
import moment from 'moment'
import uniqBy from 'lodash/uniqBy'
import { mapGetters } from 'vuex'

export default {
  props: {
    account: {
      type: Object
    }
  },

  watch: {
    '$route' (to, from) {
      this.values.accountId = this.account.id
      this.values.accountName = this.account.name
    }
  },

  data() {
    const lastTrn = this.$store.getters.trns[0]
    return {
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
    date() {
      return this.$store.state.filter.date
    },
    trnsList() {
      const trnsInThisDay = this.$store.getters.trns
        .filter(t => moment(t.date).format('D.MM.YY') === moment(this.date).format('D.MM.YY'))
      return trnsInThisDay
    },
    lastCategories() {
      return uniqBy(this.trns, 'categoryName').slice(0, 10)
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
      toastr.info('Создание...')
      const time = moment().format('HH:mm:ss')
      const day = moment(this.date).format('D.MM.YY')
      const date = moment(`${day} ${time}`, 'D.MM.YY HH:mm:ss').valueOf()

      let values = {}

      if (!this.values.amount) {
        this.errors = 'Пусто'
        this.loading = false
        return false
      }
      else {
        // Number
        if (+this.values.amount > 0) {
          this.errors = 'Меньше нуля'
          values = {
            ...this.values,
            amount: +this.values.amount,
            date
          }
        }
        // Array
        else {
          const amountsArray = this.values.amount.split(',')
          values = []
          for (let value of amountsArray) {
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
      console.log(result)
      if (result) {
        toastr.success('Успешно создано!')
        this.values.amount = ''
        this.values.description = ''
        this.loading = false
      }
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
    // this.rootEl.removeEventListener('click', this.closeDropdown())
  }
}
</script>

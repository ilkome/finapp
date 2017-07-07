<template lang="pug">
.rightBar__form
  h2.title._border._mbs
    template(v-if="action === 'create'") Create trn
    template(v-if="action === 'update'") Update trn

  .filter
    .link(@click="setNextPrevDate('prev')")
      .fa.fa-chevron-left
    .filterItem._date
      .fa.fa-clock-o
      .filterItemDate {{ values.date | date }}
    .link(@click="setNextPrevDate('next')")
      .fa.fa-chevron-right


  .amount(:class="(values.type === 1) ? '_income' : '_expense'")
    a.amountCount(@click="setTrnType()")
      .amountCountText
        template(v-if="values.type === 1") +
        template(v-else) -

    .amountValue
      input.amountValueInput(
        v-model.lazy="values.amount",
        @keyup.enter="onSubmitForm",
        type="text" name="amount" placeholder="0")

  template(v-if="lastCategories.length > 1")
    .formCategories
      h4._marginBottomSmall Categories
      .categoriesIcons
        .categoriesIcons__el(v-for="trn in lastCategories")
          a.icon._link(
            :class="[{_active: (trn.categoryId === values.categoryId)}, `icon-${trn.categoryId}`]",
            :title="trn.categoryName",
            @click.prevent="setCategory(trn.categoryId)")
            .icon__pic
            .icon__label {{ trn.categoryName }}

  .formCategories
    h4._marginBottomSmall Accounts
    .categoriesIcons
      .categoriesIcons__el(v-for="account in accounts")
        a.icon._link(
          :class="[{_active: (account.id === values.accountId)}, `bg-${account.id}`]",
          :title="account.name",
          @click.prevent="setAccound(account.id)")
          .icon__abbr {{ account.name.charAt(0) }}{{ account.name.charAt(1) }}
          .icon__label {{ account.name }}

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

  .desc
    input.input-filter._nomargin(
      v-model.trim="values.description"
      type="text" name="description" placeholder="Description")

  .action
    div(v-if="errors") {{ errors }}
    template(v-if="action === 'create'")
      .actionButton(@click.prevent="onSubmitForm()") Create trn
    template(v-if="action === 'update'")
      .actionButton(@click.prevent="onSubmitForm()") Update trn
</template>


<script>
import mathjs from 'mathjs'
import moment from 'moment'
import uniqBy from 'lodash/uniqBy'
import { mapGetters } from 'vuex'
import { focus } from 'vue-focus'

export default {
  directives: { focus: focus },

  watch: {
    '$route'(to, from) {
      if (this.$route.params.id) {
        const accountId = +this.$route.params.id
        this.setAccound(accountId)
      }
    },
    action() {
      this.fillValues()
    },
    updateTrn() {
      this.fillValues()
    }
  },

  beforeMount() {
    this.fillValues()
  },

  data() {
    return {
      focused: false,
      filter: '',
      errors: false,
      loading: false,
      rootEl: document.querySelector('.app'),
      show: {
        accounts: false,
        categories: false
      },
      values: {}
    }
  },

  computed: {
    ...mapGetters(['trns', 'accounts', 'categories']),

    action() {
      return this.$store.state.trnForm.action
    },

    updateTrn() {
      return this.$store.state.trnForm.isUpdateTrn
    },

    categoriesList() {
      return this.categories.filter(category =>
        category.name.toLowerCase().search(this.filter.toLowerCase()) !== -1)
    },

    lastCategories() {
      return uniqBy(this.trns, 'categoryName').slice(0, 10)
    }
  },

  methods: {
    fillValues() {
      let lastTrn = this.$store.getters.trns[0]
      if (!lastTrn) {
        lastTrn = {
          accountId: '',
          accountName: ''
        }
      }
      let values = {}

      // Create
      if (this.$store.state.trnForm.action === 'create') {
        values = {
          date: moment(),
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

      // Update
      if (this.$store.state.trnForm.action === 'update') {
        const trn = this.trns.find(trn => trn.id === this.$store.state.trnForm.isUpdateTrn)
        values = {
          ...trn,
          date: moment(trn.date),
          accountId: trn.accountId,
          amount: trn.amount + '', // Hack for trn update
          categoryId: trn.categoryId,
          type: trn.type,
          currency: trn.currency,
          description: trn.description
        }
      }

      this.values = values
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
      if (way === 'prev') date = moment(this.values.date).subtract(1, 'days')
      if (way === 'next') date = moment(this.values.date).add(1, 'days')
      this.values.date = date
    },

    async onSubmitForm() {
      this.$store.commit('showLoader')

      function calc(number) {
        try {
          return mathjs.chain(number.replace(/\s/g, '')).eval().round().value
        } catch (error) {
          console.error('calc:', error.message)
          return false
        }
      }

      try {
        console.group('TrnForm: onSubmitForm')
        console.log('Action', this.action)
        const currentTime = moment().format('HH:mm:ss')
        const day = moment(this.values.date).format('D.MM.YY')
        const date = moment(`${day} ${currentTime}`, 'D.MM.YY HH:mm:ss').valueOf()
        const amount = this.values.amount
        const dataFromTrns = []

        // Empty
        if (!amount) {
          console.log('empty amount')
          this.errors = 'Empty amount'
          this.$store.commit('showError', 'components/TrnForm: Empty amount')
          throw new Error('components/TrnForm: Empty amount')
        }

        // One amount
        if (amount && amount.indexOf(',') === -1) {
          const calcAmount = calc(amount)
          console.log('One:', calcAmount)

          if (calcAmount && calcAmount > 0) {
            dataFromTrns.push({
              ...this.values,
              amount: calcAmount,
              date
            })
            this.errors = false
          } else {
            this.errors = 'One amount: wrong number or less than 0'
          }
        }

        // Few amounts
        if (amount && amount.indexOf(',') !== -1) {
          const amountsList = amount.split(',')

          for (const amountItem of amountsList) {
            const calcAmount = calc(amountItem)
            console.log('Few:', calcAmount)

            if (calcAmount && calcAmount > 0) {
              dataFromTrns.push({
                ...this.values,
                amount: calcAmount,
                date
              })
              this.errors = false
            } else {
              this.errors = 'Few amount: wrong number or less than 0'
            }
          }
        }

        let done = false

        // Create
        if (this.action === 'create') {
          const isAddedTrns = await this.$store.dispatch('addTrns', dataFromTrns)
          if (isAddedTrns) done = true
        }

        // Update only one trn
        if (this.action === 'update') {
          const isTrnUpdated = await this.$store.dispatch('updateTrn', dataFromTrns[0])
          console.log(this.values.id)
          if (isTrnUpdated) {
            done = true
            this.$store.commit('setUpdatedTrn', this.values.id)
            this.$store.commit('toogleTrnForm')
          }
        }

        // On done
        if (done) {
          this.values.amount = ''
          this.values.description = ''
          this.filter = ''
          this.$store.commit('disableLoader')
        }
      } catch (error) {
        console.error(error)
      } finally {
        console.groupEnd()
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
  }
}
</script>

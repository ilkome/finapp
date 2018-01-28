<template lang="pug">
.rightBar
  .sidebar__overlay(
    @click="$store.commit('toogleTrnForm', 'hide')"
    :class="{ _active: $store.state.trnForm.isShow }"
  )
  .sidebar__close(@click="$store.commit('toogleTrnForm', 'hide')")
    .sidebar__close__title
      template(v-if="action === 'create' && values.type !== 2") Create trn
      template(v-if="action === 'update'") Update trn
      template(v-if="values.type === 2") Create transfer
    .sidebar__close__icon: .fa.fa-plus

  .rightBar__in
    .rightBar__main

      .rightBar__main__in
        .trnForm__date
          .trnForm__date__link(
            @click="setNextPrevDate('prev')"
            @keyup.enter.prevent="setNextPrevDate('prev')"
          ): .arrow._left
          .trnForm__date__value
            .trnForm__date__value__icon.fa.fa-clock-o
            .trnForm__date__value__text {{ values.date | date }}
          .trnForm__date__link(
            @click="setNextPrevDate('next')",
            @keyup.enter.prevent="setNextPrevDate('next')"
          ): .arrow._right

        .amount(:class="amountClass")
          .amountCount(
            @click="setFormType()"
            @keyup.enter.prevent="setFormType()"
          )
            .amountCountText
              template(v-if="values.type === 1") +
              template(v-else-if="values.type === 0") -
              template(v-else) =

          .amountValue
            input.amountValueInput(
              v-model.lazy="values.amount",
              @keyup.enter="onSubmitForm",
              type="text"
              name="amount"
              placeholder="0"
            )


        //- Regual trn
        template(v-if="values.type !== 2")
          //- Categories
          .trnForm__icons
            template(v-if="lastUsedCategories.length || categories.length")
              .trnForm__subTitle
                .trnForm__subTitle__flex
                  template(v-if="values.categoryId")
                    .icon(
                      :style="{ background: selectedCategory.color }"
                      :title="selectedCategory.name"
                    )
                      .icon__i(:class="selectedCategory.icon")
                    .name {{ selectedCategory.name }}

              .iconsGroup
                .iconsGroup__el(v-for="category in lastUsedCategories")
                  .icon._link(
                    @click.prevent="setCategory(category.id)"
                    @keyup.enter.prevent="setCategory(category.id)"
                    :style="{ background: category.color }"
                    :title="category.name"
                  )
                    .icon__i(:class="category.icon")
                    .icon__label
                      .icon__label__in {{ category.name }}

                .iconsGroup__el
                  .icon._link._more(
                    @click.prevent="toogleCategoriesPop()"
                    @keyup.enter.prevent="toogleCategoriesPop()"
                    v-shortkey="['alt', 'arrowup']"
                    @shortkey="toogleCategoriesPop()"
                  )
                    .mdi.mdi-dots-horizontal
                    .icon__label
                      .icon__label__in Show all categories
            //- No categories
            template(v-else)
              .trnForm__actions__btn(@click="$store.commit('toogleCategoryCreate')") Create category

          //- Wallets
          .trnForm__icons
            template(v-if="accounts.length")
              .trnForm__subTitle
                .trnForm__subTitle__flex
                  template(v-if="values.account")
                    .icon._round(
                      :style="{ background: values.account.color }"
                      :title="values.account.name"
                    )
                      .icon__abbr {{ values.account.name.charAt(0) }}{{ values.account.name.charAt(1) }}
                    .name {{ values.account.name }}
                    .trnForm__wallet-total {{ formatMoney(values.account.total) }}

              .iconsGroup
                .iconsGroup__el(v-for="account in accounts")
                  .icon._link._round(
                    :title="account.name"
                    :style="{ background: account.color }"
                    @click.prevent="setAccound(account)"
                    @keyup.enter.prevent="setAccound(account)"
                  )
                    .icon__abbr {{ account.name.charAt(0) }}{{ account.name.charAt(1) }}
                    .icon__label
                      .icon__label__in {{ account.name }}

            //- No wallets
            template(v-else)
              .trnForm__actions__btn(@click="$store.commit('toogleAccountCreate')") Create wallet

          .trnForm__desc
            input.input-filter._nomargin(
              v-model.trim="values.description"
              @keyup.enter="onSubmitForm"
              type="text"
              name="description"
              placeholder="Description"
            )

        //- Transfer
        template(v-if="values.type === 2")
          .trnForm__icons
            .trnForm__subTitle
              .trnForm__subTitle__flex
                .icon._round(
                  :style="{ background: values.accountFrom.color }"
                  :title="values.accountFrom.name"
                )
                  .icon__abbr {{ values.accountFrom.name.charAt(0) }}{{ values.accountFrom.name.charAt(1) }}
                .name {{ values.accountFrom.name }}
              .label From

            .iconsGroup
              .iconsGroup__el(v-for="account in accounts")
                .icon._round._link(
                  @click.prevent="setAccound(account, 'from')"
                  :class="[{_active: (account.id === values.accountFrom.id)}]"
                  :style="{ background: account.color }"
                  :title="account.name"
                )
                  .icon__abbr {{ account.name.charAt(0) }}{{ account.name.charAt(1) }}
                  .icon__label
                    .icon__label__in {{ account.name }}

          .trnForm__icons
            .trnForm__subTitle
              .trnForm__subTitle__flex
                .icon._round(
                  :style="{ background: values.accountTo.color }"
                  :title="values.accountTo.name"
                )
                  .icon__abbr {{ values.accountTo.name.charAt(0) }}{{ values.accountTo.name.charAt(1) }}
                .name {{ values.accountTo.name }}
              .label To

            .iconsGroup
              .iconsGroup__el(v-for="account in accounts")
               .icon._round._link(
                  @click.prevent="setAccound(account, 'to')"
                  :class="[{ _active: (account.id === values.accountTo.id) }]"
                  :style="{ background: account.color }"
                  :title="account.name"
                )
                  .icon__abbr {{ account.name.charAt(0) }}{{ account.name.charAt(1) }}
                  .icon__label
                    .icon__label__in {{ account.name }}

          .trnForm__desc
            input.input-filter._nomargin(
              v-model.trim="values.description"
              @keyup.enter="onSubmitForm"
              type="text"
              name="description"
              placeholder="Description"
            )

        .trnForm__actions
          .trnForm__actions__btn(
            @click.prevent="onSubmitForm()"
            @keyup.enter.prevent="onSubmitForm()"
            :class="{ _disable: $store.state.loader }"
          )
            template(v-if="$store.state.loader")
              .trnForm__actions__btn__loading
                .fa.fa-spinner
            template(v-if="action === 'create' && values.type !== 2") Create trn
            template(v-if="action === 'update'") Update trn
            template(v-if="values.type === 2") Create transfer



    //- Categories popup block
    //------------------------------------------------
    transition(name="trnFormAnimation")
      .trnForm__categories(
        v-if="isShowCategories"
        v-shortkey="['alt', 'arrowdown']",
        @shortkey="toogleShowCategories()")

        .sidebar__close(@click="toogleCategoriesPop")
          .sidebar__close__title Select category
          .sidebar__close__icon: .fa.fa-plus

        CategoryList(
          v-on:onClickContent="setCategory",
          :isShowEditActions.sync="isShowEditActions",
          view="trnForm")
</template>

<script>
import { mapGetters } from 'vuex'
import mathjs from 'mathjs'
import moment from 'moment'
import { focus } from 'vue-focus'
import formatMoney from '@/mixins/formatMoney'
import CategoryList from './categories/CategoryList.vue'

export default {
  directives: { focus: focus },
  mixins: [formatMoney],
  components: { CategoryList },

  watch: {
    account() {
      if (this.account && this.$store.state.trnForm.action === 'create') {
        this.values.account = this.account
        this.values.accountId = this.account.id
        this.values.accountName = this.account.name
      }
    },
    isShowTrnForm() {
      if (this.$store.state.trnForm.show) {
        this.focus = true
      } else {
        this.focus = false
      }
    },
    action() {
      this.fillValues()
    },
    updateTrnId() {
      if (this.updateTrnId) {
        this.fillValues()
      }
    }
  },

  mounted() {
    this.fillValues()

    document.addEventListener('keyup', (event) => {
      if (event.keyCode === 27) { // escape key
        this.$store.commit('closeTrnForm')
        this.show.categories = false
      }
    })
  },

  data() {
    return {
      focus: false,
      isShowEditActions: false,
      errors: null,
      show: {
        categories: false
      },
      lastUsedCategories: [],
      values: {
        id: null,
        account: null,
        amount: null,
        date: moment(),
        currency: 'RUB',
        type: 0,
        description: '',
        accountFrom: {},
        accountTo: {}
      }
    }
  },

  computed: {
    ...mapGetters(['trns', 'accounts', 'categories', 'getFilter']),

    $isShowTrnForm() {
      return this.$store.state.trnForm.show
    },
    action() {
      return this.$store.state.trnForm.action
    },
    amountClass() {
      switch (this.values.type) {
        case 0: return '_expense'
        case 1: return '_income'
        default: return
      }
    },
    categoryId() {
      return this.$store.state.trnForm.categoryId
    },
    account() {
      return this.getFilter.account
    },
    selectedCategory() {
      const category = this.categories.find(category => category.id === this.categoryId)
      if (category) {
        return category
      }
      return {}
    },
    isShowCategories() {
      return this.$store.state.trnForm.isShowCategories
    },
    // For fill values
    updateTrnId() {
      return this.$store.state.trnForm.updateTrnId
    }
  },

  methods: {
    fillValues() {
      // Create
      if (this.$store.state.trnForm.action === 'create') {
        const lastTrn = this.$store.getters.trns[0]
        const lastAccount = this.accounts.find(a => a.id === lastTrn.accountId)
        if (lastTrn) {
          this.$store.commit('setTrnFormCategoryId', lastTrn.categoryId)
          this.values = {
            date: moment(),
            account: lastAccount,
            accountId: lastTrn.accountId,
            accountName: lastTrn.accountName,
            amount: null,
            categoryId: lastTrn.categoryId,
            categoryName: lastTrn.categoryName,
            categoryIcon: lastTrn.categoryIcon,
            type: 0,
            currency: lastTrn.currency,
            description: '',
            accountFrom: {
              ...lastTrn.account,
              id: lastTrn.accountId,
              name: lastTrn.accountName
            },
            accountTo: {
              ...lastTrn.account,
              id: lastTrn.accountId,
              name: lastTrn.accountName
            }
          }
        }
      }

      // Update
      if (this.$store.state.trnForm.action === 'update') {
        const trn = this.trns.find(trn => trn.id === this.$store.state.trnForm.updateTrnId)
        const account = this.accounts.find(a => a.id === trn.accountId)
        if (trn) {
          this.$store.commit('setTrnFormCategoryId', trn.categoryId)
          this.values = {
            id: trn.id,
            date: moment(trn.date),
            account: account,
            accountId: trn.accountId,
            accountName: trn.accountName,
            amount: trn.amount,
            categoryId: trn.categoryId,
            categoryIcon: trn.categoryIcon,
            type: trn.type,
            currency: trn.currency,
            description: trn.description,
            accountFrom: {
              ...trn.account,
              id: trn.accountId,
              name: trn.accountName
            },
            accountTo: {
              ...trn.account,
              id: trn.accountId,
              name: trn.accountName
            }
          }
        }
      }

      const countCategoriesToShow = this.$store.state.isMobile ? 11 : 13
      const lastTrnsUnicCategory = []
      for (let i = 0; lastTrnsUnicCategory.length < countCategoriesToShow; i++) {
        if (lastTrnsUnicCategory.indexOf(this.trns[i].category) === -1) {
          lastTrnsUnicCategory.push(this.trns[i].category)
        }
      }

      this.lastUsedCategories = lastTrnsUnicCategory
    },
    toogleCategoriesPop() {
      this.$store.commit('toogleCategoriesPop')
    },
    /**
     * @param {number} categoryId - Id of selected category.
     */
    setCategory(categoryId) {
      const category = this.categories.find(category => category.id === categoryId)
      if (category) {
        this.values.categoryId = category.id
        this.values.categoryName = category.name
        this.values.categoryIcon = category.icon

        this.$store.commit('setTrnFormCategoryId', categoryId)
        // Add selected category if it doesn't exist in lastUsedCategories
        const countCategoriesToShow = this.$store.state.isMobile ? 10 : 12
        if (!this.lastUsedCategories.find(cat => cat.id === this.categoryId)) {
          this.lastUsedCategories = [...this.lastUsedCategories.slice(0, countCategoriesToShow), this.selectedCategory]
        }
      }
    },
    setFormType() {
      switch (this.values.type) {
        case 0:
          this.values.type = 1
          break
        case 1:
          // Transfer
          if (this.action !== 'update') {
            this.values.type = 2
            const transferCategory = this.categories.find(cat => cat.name === 'Перевод')
            if (transferCategory) {
              this.setCategory(transferCategory.id)
              this.errors = null
            } else {
              this.errors = 'You do not have transfer category!'
            }
          } else {
            this.values.type = 0
          }
          break
        default:
          this.values.type = 0
      }
    },
    setAccound(account, pos) {
      if (account) {
        switch (pos) {
          case 'to':
            this.values.accountTo = account
            this.values.currency = account.currency
            break
          case 'from':
            this.values.accountFrom = account
            this.values.currency = account.currency
            break
          default:
            this.values.account = account
            this.values.accountId = account.id
            this.values.accountName = account.name
            this.values.currency = account.currency
        }
      }
    },
    setNextPrevDate(way) {
      if (way === 'prev') this.values.date = moment(this.values.date).subtract(1, 'days')
      if (way === 'next') {
        if (moment(this.values.date).startOf('day').valueOf() !== moment().startOf('day').valueOf()) {
          this.values.date = moment(this.values.date).add(1, 'days')
        }
      }
    },
    async onSubmitForm() {
      this.focus = false

      function calc(number) {
        return mathjs.chain(number.replace(/\s/g, '')).eval().round().value
      }

      try {
        const currentTime = moment().format('HH:mm:ss')
        const day = moment(this.values.date).format('D.MM.YY')
        const date = moment(`${day} ${currentTime}`, 'D.MM.YY HH:mm:ss').valueOf()
        let formatedValues = {}

        // Empty
        if (!this.values.amount) {
          this.focus = true
          this.$notify({
            group: 'foo',
            title: 'Empty amount',
            text: 'Please write an amount.',
            type: 'error'
          })
          return
        }
        if (!this.values.categoryId) {
          this.$notify({
            group: 'foo',
            title: 'Error',
            text: 'Please select category.',
            type: 'error'
          })
          return
        }
        if (!this.values.accountId && this.values.type !== 2) {
          this.$notify({
            group: 'foo',
            title: 'Error',
            text: 'Please select account.',
            type: 'error'
          })
          return
        }

        // Check amount
        const calcAmount = calc(String(this.values.amount))
        if (!calcAmount && calcAmount < 0) {
          this.$notify({
            group: 'foo',
            title: 'Error',
            text: 'One amount: wrong number or less than 0',
            type: 'error'
          })
          return
        }

        // Transfer
        if (this.values.type === 2) {
          // Check for same accounts in transfer
          if (this.values.accountFrom.id === this.values.accountTo.id) {
            this.$notify({
              group: 'foo',
              title: 'Error',
              text: 'You can not make transfer to same account',
              type: 'error'
            })
            return
          }
        }

        this.$store.commit('showLoader')

        formatedValues = {
          accountId: this.values.accountId,
          amount: calcAmount,
          categoryId: this.values.categoryId,
          currency: this.values.currency,
          date,
          description: this.values.description,
          type: this.values.type
        }

        // Create
        if (this.action === 'create') {
          // Transfer
          if (this.values.type === 2) {
            // Expence
            const accountFromValues = {
              ...formatedValues,
              accountId: this.values.accountFrom.id,
              type: 0
            }
            // Incomes
            const accountToValues = {
              ...formatedValues,
              accountId: this.values.accountTo.id,
              type: 1
            }
            await this.$store.dispatch('addTrn', accountFromValues)
            await this.$store.dispatch('addTrn', accountToValues)
            this.values.amount = ''
            this.values.type = 0
            this.values.description = ''
          } else {
            await this.$store.dispatch('addTrn', formatedValues)
            this.values.amount = ''
            this.values.description = ''
          }
        }

        // Update
        if (this.action === 'update' && this.values.type !== 2) {
          await this.$store.dispatch('updateTrn', {
            id: this.values.id,
            ...formatedValues
          })

          this.$store.commit('closeTrnForm')
        }

        this.$store.commit('closeLoader')
        this.$notify({
          group: 'foo',
          title: 'Succesed',
          text: 'Trn was created.',
          type: 'success'
        })
      } catch (error) {
        this.errors = error.message
      }
    }
  }
}
</script>

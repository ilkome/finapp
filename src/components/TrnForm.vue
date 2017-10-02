<template lang="pug">
.trnForm__in
  .trnForm__form
    .trnForm__form__close(@click="$store.commit('toogleTrnForm')") +
    .trnForm__form__in
      h4.title._border._mbs
        template(v-if="action === 'create'") Create trn
        template(v-if="action === 'update'") Update trn

      .trnForm__date
        .trnForm__date__link(
          @click="setNextPrevDate('prev')",
          @keyup.enter.prevent="setNextPrevDate('prev')",
          aria-checked="true", tabindex="0"
        ): .fa.fa-chevron-left
        .trnForm__date__value
          .fa.fa-clock-o
          .trnForm__date__value__in {{ values.date | date }}
        .trnForm__date__link(
          @click="setNextPrevDate('next')",
          @keyup.enter.prevent="setNextPrevDate('next')",
          aria-checked="true", tabindex="0"
        ): .fa.fa-chevron-right

      .amount(:class="(values.type === 1) ? '_income' : '_expense'")
        a.amountCount(
          @click="setTrnType()"
          @keyup.enter.prevent="setTrnType()",
          aria-checked="false", tabindex="0"
        )
          .amountCountText
            template(v-if="values.type === 1") +
            template(v-else) -

        .amountValue
          input.amountValueInput(
            v-model.lazy="values.amount",
            @keyup.enter="onSubmitForm",
            v-focus.lazy="$store.state.trnForm.isShow && !show.categories && !$store.state.isMobile",
            type="text",
            name="amount",
            placeholder="0",
            aria-checked="false", tabindex="0"
          )

      .trnForm__icons
        .trnForm__subTitle
          template(v-if="values.categoryId")
            .name {{ selectedCategory.name }}
          .label Category
        .categoriesIcons
          .categoriesIcons__el(v-for="category in lastUsedCategories")
            .icon._link(
              :class="{_active: (category.id === selectedCategory.id)}",
              @click.prevent="setCategory(category.id)",
              @keyup.enter.prevent="setCategory(category.id)",
              :style="`background: ${category.color}`",
              :title="category.name",
              aria-checked="false", tabindex="0")
              .icon__i(:class="category.icon")
              .icon__label {{ category.name }}

          .categoriesIcons__el
            .icon._link._more(
              @click.prevent="toogleCategoriesPop()",
              @keyup.enter.prevent="toogleCategoriesPop()",
              v-shortkey="['alt', 'arrowup']",
              @shortkey="toogleCategoriesPop()",
              aria-checked="false", tabindex="0")
              .mdi.mdi-dots-horizontal
              .icon__label Show all categories

      .trnForm__icons
        .trnForm__subTitle
          .name {{ values.accountName }}
          .label Account
        .categoriesIcons
          .categoriesIcons__el(v-for="account in accounts")
            a.icon._link(
              :class="[{_active: (account.id === values.accountId)}, `bg-${account.id}`]",
              :title="account.name",
              @click.prevent="setAccound(account.id)",
              @keyup.enter.prevent="setAccound(account.id)",
              aria-checked="false", tabindex="0"
            )
              .icon__abbr {{ account.name.charAt(0) }}{{ account.name.charAt(1) }}
              .icon__label {{ account.name }}

      .trnForm__desc
        input.input-filter._nomargin(
          v-model.trim="values.description",
          @keyup.enter="onSubmitForm",
          type="text",
          name="description",
          placeholder="Description",
          aria-checked="false", tabindex="0"
        )

      .trnForm__actions
      .trnForm__errors(v-if="errors") {{ errors }}
      .trnForm__actions__btn(
        @click.prevent="onSubmitForm()",
        @keyup.enter.prevent="onSubmitForm()",
        aria-checked="false", tabindex="0")
        template(v-if="action === 'create'") Create trn
        template(v-if="action === 'update'") Update trn

  //- Categories popup block
  //------------------------------------------------
  transition(name="trnFormAnimation")
    .trnForm__categories(
      v-if="isShowCategories"
      v-shortkey="['alt', 'arrowdown']",
      @shortkey="toogleShowCategories()")

      .trnForm__categories__in
        .trnForm__header
          h4.title._mbn Select category
          .trnForm__header__close.btn._mini(@click.prevent="toogleCategoriesPop()") Back

        CategoryList(
          v-on:onClickContent="setCategory",
          :isShowEditActions.sync="isShowEditActions",
          view="trnForm")
</template>

<script>
import mathjs from 'mathjs'
import moment from 'moment'
import uniqBy from 'lodash/uniqBy'
import { mapGetters } from 'vuex'
import { focus } from 'vue-focus'
import CategoryList from './categories/CategoryList.vue'

export default {
  directives: { focus: focus },
  components: { CategoryList },

  watch: {
    account() {
      if (this.account && this.$store.state.trnForm.action === 'create') {
        this.values.accountId = this.account.id
        this.values.accountName = this.account.name
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
      isShowEditActions: false,
      errors: null,
      show: {
        categories: false
      },
      lastUsedCategories: [],
      values: {
        id: null,
        amount: null,
        date: moment(),
        currency: '',
        type: 0,
        description: ''
      }
    }
  },

  computed: {
    ...mapGetters(['trns', 'accounts', 'categories', 'getFilter']),

    action() {
      return this.$store.state.trnForm.action
    },

    categoryId() {
      return this.$store.state.trnForm.categoryId
    },

    account() {
      return this.$store.getters.getFilter.account
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
        if (lastTrn) {
          this.$store.commit('setTrnFormCategoryId', lastTrn.categoryId)
          this.values = {
            date: moment(),
            accountId: lastTrn.accountId,
            accountName: lastTrn.accountName,
            amount: null,
            categoryId: lastTrn.categoryId,
            categoryName: lastTrn.categoryName,
            categoryIcon: lastTrn.categoryIcon,
            type: 0,
            currency: lastTrn.currency,
            description: ''
          }
        }
      }

      // Update
      if (this.$store.state.trnForm.action === 'update') {
        const trn = this.trns.find(trn => trn.id === this.$store.state.trnForm.updateTrnId)
        this.$store.commit('setTrnFormCategoryId', trn.categoryId)
        this.values = {
          id: trn.id,
          date: moment(trn.date),
          accountId: trn.accountId,
          accountName: trn.accountName,
          amount: trn.amount,
          categoryId: trn.categoryId,
          categoryIcon: trn.categoryIcon,
          type: trn.type,
          currency: trn.currency,
          description: trn.description
        }
      }

      const lastTrnsUnicCategory = uniqBy(this.trns.slice(0, 50), 'categoryId').slice(0, 15)
      const lastUsedCategoriesIdsFromTrns = lastTrnsUnicCategory.map(trn => trn.categoryId)
      this.lastUsedCategories = this.categories
        .filter(category => lastUsedCategoriesIdsFromTrns.indexOf(category.id) >= 0)
        .slice(0, 15)
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
        if (!this.lastUsedCategories.find(cat => cat.id === this.categoryId)) {
          this.lastUsedCategories = [...this.lastUsedCategories.slice(0, 14), this.selectedCategory]
        }
      }
    },

    setTrnType() {
      this.values.type = (this.values.type === 1) ? 0 : 1
    },

    setAccound(accountId) {
      const account = this.accounts.find(account => account.id === accountId)
      if (account) {
        this.values.accountId = account.id
        this.values.accountName = account.name
        this.values.currency = account.currency
      }
    },

    setNextPrevDate(way) {
      if (way === 'prev') this.values.date = moment(this.values.date).subtract(1, 'days')
      if (way === 'next') this.values.date = moment(this.values.date).add(1, 'days')
    },

    async onSubmitForm() {
      this.$store.commit('showLoader')

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
          this.errors = 'Empty amount'
          this.$store.commit('closeLoader')
          return
        }
        if (!this.values.categoryId) {
          this.errors = 'Please select category'
          this.$store.commit('closeLoader')
          return
        }
        if (!this.values.accountId) {
          this.errors = 'Please select account'
          this.$store.commit('closeLoader')
          return
        }

        const calcAmount = calc(String(this.values.amount))
        if (calcAmount && calcAmount > 0) {
          formatedValues = {
            ...this.values,
            amount: calcAmount,
            date
          }
          this.errors = false
        } else {
          this.errors = 'One amount: wrong number or less than 0'
        }

        if (!this.errors) {
          // Create
          if (this.action === 'create') {
            await this.$store.dispatch('addTrn', formatedValues)
            this.values.amount = ''
            this.values.description = ''
            this.filter = ''
          }

          // Update
          if (this.action === 'update') {
            await this.$store.dispatch('updateTrn', formatedValues)
            this.$store.commit('closeTrnForm')
          }
        }
        this.$store.commit('closeLoader')
      } catch (error) {
        this.errors = error.message
        this.$store.commit('closeLoader')
      }
    }
  }
}
</script>

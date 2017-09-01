import mathjs from 'mathjs'
import moment from 'moment'
import uniqBy from 'lodash/uniqBy'
import { mapGetters } from 'vuex'
import { focus } from 'vue-focus'
import CategoryCreate from './categories/CategoryCreate.vue'
import CategoryList from './categories/CategoryList.vue'

export default {
  directives: { focus: focus },
  components: { CategoryCreate, CategoryList },

  watch: {
    '$route'(to, from) {
      if (this.$route.params.id) {
        const routeId = this.$route.params.id
        const routePath = this.$route.path
        if (/(categories)/g.test(routePath)) this.setCategory(routeId)
        if (/(accounts)/g.test(routePath)) this.setAccound(routeId)
      }
    },

    action() {
      this.fillValues()
    },

    // Update values then select new trn
    isUpdateTrn() {
      if (this.isUpdateTrn) {
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
        date: moment(),
        currency: '',
        type: 0,
        description: ''
      }
    }
  },

  computed: {
    ...mapGetters(['trns', 'accounts', 'categories']),

    action() {
      return this.$store.state.trnForm.action
    },

    categoryId() {
      return this.$store.state.trnForm.categoryId
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
    isUpdateTrn() {
      return this.$store.state.trnForm.isUpdateTrn
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
        const trn = this.trns.find(trn => trn.id === this.$store.state.trnForm.isUpdateTrn)
        this.$store.commit('setTrnFormCategoryId', trn.categoryId)
        this.values = {
          id: trn.id,
          date: moment(trn.date),
          accountId: trn.accountId,
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
      this.$scrollTo('.trnForm__form', 300, { container: '.trnForm' })
    },

    /**
     * @param {number} categoryId - Id of selected category.
     */
    setCategory(categoryId) {
      const category = this.categories.find(category => category.id == categoryId)
      this.values.categoryId = category.id
      this.values.categoryName = category.name
      this.values.categoryIcon = category.icon

      this.$store.commit('setTrnFormCategoryId', categoryId)
      // Add selected category if it doesn't exist in lastUsedCategories
      if (!this.lastUsedCategories.find(cat => cat.id == this.categoryId)) {
        this.lastUsedCategories = [...this.lastUsedCategories.slice(0, 14), this.selectedCategory]
      }
    },

    setTrnType() {
      this.values.type = (this.values.type === 1) ? 0 : 1
    },

    setAccound(accountId) {
      const account = this.accounts.find(account => account.id === accountId)
      if (account) {
        this.values.accountId = account.id
        this.values.currency = account.currency
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
          this.errors = error
        }
      }

      try {
        const currentTime = moment().format('HH:mm:ss')
        const day = moment(this.values.date).format('D.MM.YY')
        const date = moment(`${day} ${currentTime}`, 'D.MM.YY HH:mm:ss').valueOf()
        const amount = String(this.values.amount)
        let formatedValues = {}

        // Empty
        if (!amount) {
          this.errors = 'Empty amount'
        }

        const calcAmount = calc(amount)
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
            const isAddedTrns = await this.$store.dispatch('addTrn', formatedValues)
            console.log(isAddedTrns)

            if (isAddedTrns) {
              this.values.amount = ''
              this.values.description = ''
              this.filter = ''
            }
          }

          // Update
          if (this.action === 'update') {
            const updatedTrnId = await this.$store.dispatch('updateTrn', formatedValues)
            if (updatedTrnId) {
              this.$store.commit('closeTrnForm')
            }
          }
        }
      } catch (error) {
        this.errors = error
      }
    }
  }
}

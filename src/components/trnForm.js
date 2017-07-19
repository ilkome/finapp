import mathjs from 'mathjs'
import Fuse from 'fuse.js'
import moment from 'moment'
import uniqBy from 'lodash/uniqBy'
import orderBy from 'lodash/orderBy'
import { mapGetters } from 'vuex'
import { focus } from 'vue-focus'
import TrnItem from './TrnItem.vue'
import CategoryList from './CategoryList.vue'

export default {
  directives: { focus: focus },

  components: { TrnItem, CategoryList },

  watch: {
    '$route'(to, from) {
      if (this.$route.params.id) {
        const routeId = +this.$route.params.id
        const routePath = this.$route.path
        if (/(categories)/g.test(routePath)) this.setCategory(routeId)
        if (/(accounts)/g.test(routePath)) this.setAccound(routeId)
      }
    },

    action() {
      this.fillValues()
    },

    isUpdateTrn() {
      if (this.$store.state.trnForm.isUpdateTrn) {
        this.fillValues()
      }
    }
  },

  beforeMount() {
    this.fillValues()
  },

  mounted() {
    document.addEventListener('keyup', (event) => {
      if (event.keyCode === 27) { // escape key
        console.log('document.addEventListener: keyup')
        this.$store.commit('closeTrnForm')
        this.show.categories = false
      }
    })
  },

  data() {
    return {
      focused: false,
      filter: '',
      errors: false,
      loading: false,
      show: {
        accounts: false,
        categories: false
      },
      values: {},
      showedChildrenCategories: [],
      lastCategories: [],
      activeCategory: {
        parent: 0,
        child: 0
      }
    }
  },

  computed: {
    ...mapGetters(['trns', 'accounts', 'categories']),

    action() {
      return this.$store.state.trnForm.action
    },

    isUpdateTrn() {
      return this.$store.state.trnForm.isUpdateTrn
    },

    newTrnFormForm() {
      return this.trns.find(trn => trn.id === this.$store.state.trnForm.wasUpdatedTrn)
    },

    searchedCategoriesList() {
      const searchOptions = {
        shouldSort: true,
        threshold: 0.3,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['name']
      }

      const fuse = new Fuse(this.categories, searchOptions)
      const searchResults = fuse.search(this.filter)
      const categoriesResult = []

      if (this.filter.length >= 2) {
        this.showedChildrenCategories = []

        searchResults.map(item => {
          // Root category
          if (item.parentId === 0) {
            if (this.showedChildrenCategories.indexOf(item.id) === -1) {
              this.showedChildrenCategories.push(item.id)
            }

            categoriesResult.push({
              ...item,
              children: []
            })
          }
          // Children category
          if (item.parentId > 0) {
            if (this.showedChildrenCategories.indexOf(item.parentId) === -1) {
              this.showedChildrenCategories.push(item.parentId)
            }
            const parentCategory = categoriesResult.find(category => category.id === item.parentId)

            // Category already exist in result
            if (parentCategory) {
              parentCategory.children.push(item)
            } else {
              // New category
              const parent = this.categories.find(category => category.id === item.parentId)
              categoriesResult.push({
                ...parent,
                children: [item]
              })
            }
          }
        })
      }

      return categoriesResult
    },

    categoriesList() {
      let categoriesOrganazed = []
      const rootCategories = this.categories.filter(c => c.parentId === 0)
      rootCategories.forEach((category) => {
        const childrenCategories = this.categories.filter(c => c.parentId === category.id)
        if (childrenCategories && childrenCategories.length > 0) {
          categoriesOrganazed.push({
            ...category,
            children: childrenCategories
          })
        } else {
          categoriesOrganazed.push({ ...category })
        }
      })

      categoriesOrganazed = orderBy(categoriesOrganazed, c => c.name, 'asc')

      return categoriesOrganazed
    }
  },

  methods: {
    fillValues() {
      // Create
      if (this.$store.state.trnForm.action === 'create') {
        const lastTrn = this.$store.getters.trns[0]

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

      // Update
      if (this.$store.state.trnForm.action === 'update') {
        const trn = this.trns.find(trn => trn.id === this.$store.state.trnForm.isUpdateTrn)
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

      const lastTrnsUnicCategory = uniqBy(this.trns.slice(0, 50), 'categoryId').slice(0, 19)
      const lastCategoriesIdsFromTrns = lastTrnsUnicCategory.map(trn => trn.categoryId)
      this.lastCategories = this.categories
        .filter(category => lastCategoriesIdsFromTrns.indexOf(category.id) >= 0)
        .slice(0, 19)

      const category = this.categories.find(category => category.id === this.values.categoryId)
      this.activeCategory = {
        parentId: category.id,
        childId: category.parentId
      }
    },

    toogleCategory(categoryId) {
      if (this.showedChildrenCategories.indexOf(categoryId) === -1) {
        this.showedChildrenCategories.push(categoryId)
      } else {
        this.showedChildrenCategories = this.showedChildrenCategories.filter(cId => cId !== categoryId)
      }
    },

    toogleShowCategories() {
      if (this.showedChildrenCategories.length) {
        this.showedChildrenCategories = []
      } else {
        this.categories
          .filter(category => category.parentId === 0)
          .forEach(category => this.showedChildrenCategories.push(category.id))
      }
    },

    toogleCategoriesPop() {
      this.show.accounts = false
      this.show.categories = !this.show.categories
    },

    toogleAccountsDropdown() {
      this.show.categories = false
      this.show.accounts = !this.show.accounts
    },

    setCategory(categoryId) {
      const category = this.categories.find(category => category.id === categoryId)
      if (category) {
        this.values.categoryId = categoryId
        this.values.categoryName = category.name
        this.values.categoryColor = category.color
        this.values.categoryIcon = category.icon
        this.show.categories = false

        this.activeCategory = {
          parentId: category.id,
          childId: category.parentId
        }

        // Add selected category if it doesn't exist in lastCategories
        if (!this.lastCategories.find(cat => cat.id === categoryId)) {
          this.lastCategories = [...this.lastCategories.slice(0, 18), category]
        }
      }
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
        const amount = String(this.values.amount)
        const dataFromTrns = []

        // Empty
        if (!amount) {
          console.log('empty amount')
          this.errors = 'Empty amount'
          throw new Error('components/TrnForm: Empty amount')
        }

        // One amount
        if (amount && amount.indexOf(',') === -1) {
          const calcAmount = calc(amount)
          console.log('TrnForm@One amount:', calcAmount)

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

        if (!this.errors) {
          // Create
          if (this.action === 'create') {
            const isAddedTrns = await this.$store.dispatch('addTrns', dataFromTrns)
            console.log(isAddedTrns)

            if (isAddedTrns) {
              this.values.amount = ''
              this.values.description = ''
              this.filter = ''
            }
          }

          // Update only one trn
          if (this.action === 'update') {
            const updatedTrnId = await this.$store.dispatch('updateTrn', dataFromTrns[0])
            if (updatedTrnId) {
              this.$store.commit('closeTrnForm')
            }
          }
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.$store.commit('disableLoader')
        console.groupEnd()
      }
    }
  }
}

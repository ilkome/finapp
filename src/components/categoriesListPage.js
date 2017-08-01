import Fuse from 'fuse.js'
import orderBy from 'lodash/orderBy'
import { mapGetters } from 'vuex'
import { mixin } from 'vue-focus'

export default {
  mixins: [mixin],

  data() {
    return {
      focus: false,
      filter: '',
      editedCategory: false,
      values: {
        name: null,
        color: null,
        icon: null,
        parentId: 0
      },
      newCategory: {
        name: null,
        color: null,
        icon: null,
        parentId: 0
      },
      questionId: false,
      showedChildrenCategories: []
    }
  },

  mounted() {
    setTimeout(function () {
      this.focus = true
    }.bind(this), 100)
  },

  computed: {
    ...mapGetters(['categories']),

    sortedCategories() {
      return orderBy(this.categories, c => c.parentId, 'asc')
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
          categoriesOrganazed.push({
            ...category,
            children: []
          })
        }
      })
      categoriesOrganazed = orderBy(categoriesOrganazed, c => c.name, 'asc')
      return categoriesOrganazed
    },

    cats() {
      if (!this.filter) {
        return this.categoriesList
      }

      if (this.filter.length >= 2 && this.searchedCategoriesList.length) {
        return this.searchedCategoriesList
      }
    }
  },

  methods: {
    askQuestion(accountId) {
      console.log(accountId)
      this.questionId = accountId
    },

    close() {
      this.questionId = false
    },

    toogleShowChildrenCategoriess(categoryId) {
      if (this.showedChildrenCategories.indexOf(categoryId) === -1) {
        this.showedChildrenCategories.push(categoryId)
      } else {
        this.showedChildrenCategories = this.showedChildrenCategories.filter(cId => cId !== categoryId)
      }
    },

    setEditedCategory(categoryId) {
      if (this.editedCategory === +categoryId) this.editedCategory = false
      else this.editedCategory = categoryId
    },

    async addCategory(category) {
      console.groupCollapsed('CategoriesList: addCategory')
      this.$store.commit('showLoader')
      const result = await this.$store.dispatch('addCategory', category)
      if (result) {
        this.newCategory.name = ''
        this.newCategory.parentId = ''
        this.$store.commit('disableLoader')
      }
      console.groupEnd()
    },

    async updateCategory(category, values) {
      console.groupCollapsed('CategoriesList: updateCategory')
      this.$store.commit('showLoader')
      const updatedCategory = {
        ...category,
        ...values
      }
      const result = await this.$store.dispatch('updateCategory', updatedCategory)
      if (result) {
        this.editedCategory = false
        this.$store.commit('disableLoader')
      }
      console.groupEnd()
    },

    async deleteCategory(categoryId) {
      this.questionId = false
      console.groupCollapsed('CategoriesList: deleteCategory')
      this.$store.commit('showLoader')
      await this.$store.dispatch('deleteCategory', +categoryId)
      this.$store.commit('disableLoader')
      console.groupEnd()
    }
  }
}

import { mapGetters } from 'vuex'
import orderBy from 'lodash/orderBy'
import { mixin } from 'vue-focus'

export default {
  mixins: [mixin],

  data() {
    return {
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

  computed: {
    ...mapGetters(['categories']),

    sortedCategories() {
      return orderBy(this.categories, c => c.parentId, 'asc')
    },

    categoriesList() {
      let filteredCategories = []
      if (this.filter !== '') {
        filteredCategories = this.categories
          .filter(c => c.name.toLowerCase().search(this.filter.toLowerCase()) !== -1)
      } else {
        filteredCategories = this.categories
      }

      const sortedCategories = []
      const rootCategories = filteredCategories.filter(c => c.parentId === 0)
      rootCategories.forEach((category) => {
        const childrenCategories = filteredCategories.filter(c => c.parentId === category.id)
        if (childrenCategories && childrenCategories.length > 0) {
          sortedCategories.push({
            ...category,
            children: childrenCategories
          })
        } else {
          sortedCategories.push({ ...category })
        }
      })

      return orderBy(sortedCategories, c => c.name, 'asc')
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

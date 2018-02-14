import firebase from 'firebase'
import orderBy from 'lodash/orderBy'
import formatCategory from '../helpers/formatCategory'

const store = {
  state: {
    all: [],
    list: false,
    show: false,
    edit: false,
    editCategory: null,
    create: false
  },

  getters: {
    categories(state) {
      return state.all
    }
  },

  actions: {
    async setCategories({ commit }, data) {
      if (data && data.categories) {
        const categories = data.categories
        const preparedCategories = []

        // Create array
        for (const key in categories) {
          preparedCategories.push({
            ...categories[key],
            id: key
          })
        }

        // Format
        const formatedCategories = preparedCategories.map(category => {
          return formatCategory(category, preparedCategories)
        })

        commit('setCategories', formatedCategories)
      }
    },
    async addCategory({ commit, state, rootState }, values) {
      try {
        const formatedValues = {
          name: values.name.trim(),
          color: values.color,
          icon: values.icon,
          parentId: values.parentId ? values.parentId : 0,
          showStat: values.showStat ? values.showStat : 0
        }

        const db = await firebase.database()
        const result = await db.ref(`users/${rootState.user.user.uid}/categories`).push(formatedValues)
          .then(async (data) => {
            const key = data.key
            const newCategory = {
              ...values,
              id: key
            }
            commit('addCategory', formatCategory(newCategory, state.all))
            commit('closeLoader')
            return true
          })
          .catch(error => {
            commit('showError', `store/categories/addCategory: ${error.message}`)
          })
        return result
      } catch (error) {
        commit('showError', `store/categories/addCategory: ${error.message}`)
      }
    },
    async deleteCategory({ commit, rootState }, id) {
      try {
        const db = await firebase.database()
        await db.ref(`users/${rootState.user.user.uid}/categories/${id}`)
          .remove()
          .catch(error => {
            console.error(error)
            commit('showError', `store/categories/deleteCategory: ${error.message}`)
          })
        commit('deleteCategory', id)
      } catch (error) {
        commit('showError', `store/categories/deleteCategory: ${error.message}`)
      }
    },
    async updateCategory({ commit, state, rootState }, values) {
      try {
        const id = values.id
        const categories = rootState.categories.all
        const formatedValues = {
          name: values.name.trim(),
          color: values.color,
          icon: values.icon,
          parentId: values.parentId ? values.parentId : 0,
          showStat: values.showStat && values.showStat
        }

        const db = await firebase.database()
        await db.ref(`users/${rootState.user.user.uid}/categories/${id}`)
          .update(formatedValues)
          .catch(error => {
            console.error(error)
            commit('showError', `store/categories/updateCategory: ${error.message}`)
          })
        const formatedCategory = formatCategory({ id, ...formatedValues }, categories)

        commit('updateCategory', formatedCategory)
        commit('closeLoader')
      } catch (error) {
        console.error(error)
        commit('showError', `store/categories/updateCategory: ${error.message}`)
      }
    }
  },

  mutations: {
    setCategories(state, data) {
      state.all = data
    },
    setEditCategory(state, category) {
      state.editCategory = category
    },
    addCategory(state, category) {
      const categories = [
        category,
        ...state.all
      ]
      state.all = orderBy(categories, ['name'], ['asc'])
    },
    updateCategory(state, category) {
      const categories = [
        category,
        ...state.all.filter(c => c.id !== category.id)
      ]
      state.all = orderBy(categories, ['name'], ['asc'])
    },
    deleteCategory(state, id) {
      state.all = state.all.filter(c => c.id !== id)
    },
    toogleCategories(state, action) {
      switch (action) {
        case 'show':
          state.show = true
          break
        case 'hide':
          state.show = false
          break
        default:
          state.show = !state.show
      }
    },
    toogleCategoriesList(state, action) {
      switch (action) {
        case 'show':
          state.list = true
          break
        case 'hide':
          state.list = false
          break
        default:
          state.list = !state.list
      }
    },
    toogleCategoryCreate(state, action) {
      state.edit = false
      state.editCategory = null
      switch (action) {
        case 'show':
          state.create = true
          break
        case 'hide':
          state.create = false
          break
        default:
          state.create = !state.create
      }
    },
    toogleCategoryEdit(state, action) {
      state.create = false
      switch (action) {
        case 'show':
          state.edit = true
          break
        case 'hide':
          state.edit = false
          break
        default:
          if (state.edit) {
            state.edit = false
            state.editCategory = null
          } else {
            state.edit = true
          }
      }
    }
  }
}

export default store

import axios from 'axios'
import { getCategories } from '../../api/api'
import { CATEGORIES_URL } from '../../constants'
import orderBy from 'lodash/orderBy'

const store = {
  state: {
    all: []
  },

  getters: {
    categories(state) {
      return state.all
    }
  },

  actions: {
    async getCategories({ commit }) {
      const categories = await getCategories()
      const formatedCategories = categories.map(cat => {
        const id = +cat.id
        const name = cat.name
        const parentId = +cat.parentId
        const description = cat.description
        return {
          id,
          name,
          parentId,
          description
        }
      })

      commit('getCategories', formatedCategories)
    },

    // update
    async updateCategory({ commit, dispatch }, category) {
      console.log(category)
      try {
        const updatedTrn = await axios.put(`${CATEGORIES_URL}/${category.id}`, category)
        const result = updatedTrn.data
        // if ok
        if (result === 1) {
          const getTrn = await axios.get(`${CATEGORIES_URL}/${category.id}`, {
            params: { transform: 1 }
          })
          await commit('updateCategory', getTrn.data)
          return true
          console.log('Category: edited!', getTrn.data)
        } else {
          console.error('Ошибка создания категории 1')
          return false
        }
      } catch (e) {
        console.error('Ошибка создания категории 2', e)
        return false
      }
    },

    async deleteCategory({ commit, dispatch }, id) {
      dispatch('setAppStatus', `Удаление ${id}...`, false)
      const request = await axios.delete(`${CATEGORIES_URL}/${id}`)
      const result = request.data
      if (result === 1) {
        dispatch('setAppStatus', `Удалено ${id}`)
        commit('deleteCategory', id)
      } else {
        dispatch('setAppStatus', `Не удалено ${id}`)
      }
    }
  },

  mutations: {
    getCategories(state, data) {
      state.all = data
    },

    updateCategory(state, category) {
      const categories = [category, ...state.all.filter(c => c.id !== category.id)]
      const sortedCategories = orderBy(categories, ['name'], ['asc'])
      state.all = sortedCategories
    },

    deleteCategory(state, id) {
      state.all = state.all.filter(c => c.id !== id)
    },
  }
}

export default store

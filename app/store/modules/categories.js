import axios from 'axios'
import { getCategories } from '../../api/api'
import { CATEGORIES_URL } from '../../constants'
import orderBy from 'lodash/orderBy'


// _.orderBy(users, ['user', 'age'], ['asc', 'desc'])

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
      const data = await getCategories()
      commit('getCategories', data)
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
          console.log('Category: edited!', getTrn.data)
        } else {
          console.error('Ошибка создания категории 1')
        }
      } catch (e) {
        console.error('Ошибка создания категории 2', e)
      }
    },
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
  }
}

export default store

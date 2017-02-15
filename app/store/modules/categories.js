import _ from 'lodash'
import { getCategories } from '../../api/api'

const store = {
  state: {
    all: []
  },

  getters: {
    categories(state) {
      const categories = state.all
      const sortedCategories = _.orderBy(categories, 'name', 'asc')
      return sortedCategories
    }
  },

  actions: {
    async fetchCategories({ commit }) {
      const data = await getCategories()
      commit('fetchCategories', data)
    }
  },

  mutations: {
    fetchCategories(state, data) {
      state.all = data
    }
  }
}

export default store

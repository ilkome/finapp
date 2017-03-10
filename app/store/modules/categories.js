import { getCategories } from '../../api/api'

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

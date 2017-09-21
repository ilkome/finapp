export default {
  state: {
    filter: {
      duration: 10,
      account: null
    }
  },

  getters: {
    getFilter(state) {
      return state.filter
    }
  },

  mutations: {
    setDuration(state, duration) {
      state.filter.duration = +duration
    },
    setAccount(state, account) {
      state.filter.account = account
    }
  }
}

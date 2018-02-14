import firebase from 'firebase'

const store = {
  state: {
    user: {
      displayName: null,
      email: null,
      uid: null
    }
  },

  getters: {
    user(state) {
      return state.user
    }
  },

  mutations: {
    signIn(state, user) {
      state.user = user
    },

    signOut(state) {
      state.user = {}
      firebase.auth().signOut()
    }
  }
}

export default store

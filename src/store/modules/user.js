import firebase from 'firebase'

const store = {
  state: {
    user: {}
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

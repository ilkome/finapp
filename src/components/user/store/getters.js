import { testerEmail } from '@/config'

export default {
  userUid (state, getters, rootState) {
    if (rootState.user.user) {
      return rootState.user.user.uid
    }
  },

  isTester (state) {
    if (state.user && state.user.email === testerEmail) return true
    else return false
  }
}

import moment from 'moment'
import { db } from '@/firebase'
import { generateSimpleId } from '@/utils/id'

export default {
  initProjects ({ dispatch, rootGetters }) {
    const uid = rootGetters.userUid
    const path = `users/${uid}/projects`

    db.ref(path).on('value', snapshot => {
      const items = Object.freeze(snapshot.val())
      dispatch('setProjects', items)
    }, e => console.error(e))
  },

  setProjects ({ commit }, items) {
    commit('setProjects', items)
  },

  async createProject ({ rootGetters }, values) {
    const id = generateSimpleId()
    const uid = rootGetters.userUid
    const path = `users/${uid}/projects/${id}`

    await db.ref(path)
      .set({
        name: values.name,
        editDate: moment().valueOf()
      })
      .then(() => { return true })

    return false
  }
}

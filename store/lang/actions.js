import localforage from 'localforage'
import { db } from '~/services/firebaseConfig'

export default {
  setLang ({ rootState, commit, rootGetters }, lang) {
    const uid = rootGetters['user/userUid']
    if (uid) {
      db.ref(`users/${uid}/settings/lang`).set(lang)
    }
    commit('setLang', lang)
    localforage.setItem('finapp.lang', lang)
  },

  async initLocalLang ({ rootState, commit }) {
    const localLang = await localforage.getItem('finapp.lang')
    if (localLang) { commit('setLang', localLang) }
  },

  async initDbLang ({ rootState, commit, rootGetters }) {
    const uid = rootGetters['user/userUid']
    if (uid) {
      const dbLang = await db.ref(`users/${uid}/settings/lang`).once('value')
      const lang = dbLang.val()
      if (lang && lang !== rootState.lang.lang) {
        commit('setLang', lang)
        localforage.setItem('finapp.lang', lang)
      }
    }
  }
}

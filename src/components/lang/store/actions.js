import localforage from 'localforage'
import { db } from '@/firebase'

export default {
  setLang ({ rootState, commit }, lang) {
    const uid = rootState.user.user.uid
    db.ref(`users/${uid}/settings/lang`).set(lang)
    commit('setLang', lang)
    localforage.setItem('finapp.lang', lang)
  },

  async initLocalLang ({ rootState, commit }) {
    const localLang = await localforage.getItem('finapp.lang')
    if (localLang) commit('setLang', localLang)
  },

  async initDbLang ({ rootState, commit }) {
    const uid = rootState.user.user.uid
    const dbLang = await db.ref(`users/${uid}/settings/lang`).once('value')
    const lang = dbLang.val()
    if (lang && lang !== rootState.lang.lang) {
      commit('setLang', lang)
      localforage.setItem('finapp.lang', lang)
    }
  }
}

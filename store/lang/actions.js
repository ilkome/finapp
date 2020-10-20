import localforage from 'localforage'
import { db } from '~/services/firebaseConfig'

export default {
  toogleLocale ({ dispatch }) {

  },

  setLang ({ commit, rootGetters }, lang) {
    const uid = rootGetters['user/userUid']
    if (uid) {
      db.ref(`users/${uid}/settings/lang`).set(lang)
    }
    commit('setLang', lang)
    localforage.setItem('finapp.lang', lang)

    if (this.$i18n.locales.find(i => i.code !== this.$i18n.locale)) {
      if (this.app.i18n.locale !== lang) {
        this.app.i18n.setLocale(lang)
      }
    }
  },

  async initLocalLang ({ commit }) {
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

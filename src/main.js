import firebase from 'firebase'
import moment from 'moment'
import localforage from 'localforage'
import Vue from 'vue'
import VueShortkey from 'vue-shortkey'
import Notifications from 'vue-notification'
import VTooltip from 'v-tooltip'
import velocity from 'velocity-animate'
import { app } from '@/store/firebase'
import store from '@/store/store'
import formatDate from '@/filters/date'
import App from '@/components/App.vue'
if (process.env.NODE_ENV === 'production') {
  require('@/sw.js')
}

Vue.config.productionTip = false
moment.locale('en')
moment.updateLocale('en', {
  week: {
    dow: 1
  }
})

// Filters
Vue.filter('date', formatDate)

// Plugins
Vue.use(VueShortkey)
Vue.use(Notifications, { velocity })
Vue.use(VTooltip, { enabled: window.innerWidth > 768 })

/* eslint-disable no-new */
new Vue({
  el: '.app',
  async mounted() {
    try {
      const addedOfflineTrns = await localforage.getItem('addedOfflineTrns')
      const updatedOfflineTrns = await localforage.getItem('updatedOfflineTrns')
      const deletedOfflineTrns = await localforage.getItem('deletedOfflineTrns')
      console.log('addedOfflineTrns', addedOfflineTrns)
      console.log('updatedOfflineTrns', updatedOfflineTrns)
      console.log('deletedOfflineTrns', deletedOfflineTrns)

      // Initialize the App from localStorage
      // -----------------------------------------------------------------------
      const localData = await localforage.getItem('data')
      const localTrns = await localforage.getItem('trns')
      if (localData &&
          localTrns && localTrns.length &&
          localData.accounts && localData.accounts.length &&
          localData.categories && localData.categories.length &&
          localData.rates &&
          localData.user && localData.user.uid) {
        this.$store.commit('signIn', localData.user)
        this.$store.commit('setRates', localData.rates)
        this.$store.commit('setAccounts', localData.accounts)
        this.$store.commit('setCategories', localData.categories)
        this.$store.commit('setTrns', localTrns)
        this.$store.commit('closeLoader')
        this.$store.commit('pageLoaded')
      }

      // Auth
      // -----------------------------------------------------------------------
      app.auth().onAuthStateChanged(async (user) => {
        if (user) {
          const db = firebase.database()
          const userRef = `users/${user.uid}`
          const formatedUser = {
            displayName: user.displayName,
            email: user.email,
            uid: user.uid
          }
          this.$store.commit('signIn', formatedUser)

          // Get data from firebase and dispatch to store
          // -------------------------------------------------------------------
          db.ref(`${userRef}`).on('value', async (snapshot) => {
            const val = snapshot.val()
            console.log('val', val)
            this.$store.dispatch('setRates')
            this.$store.dispatch('setCategories', val)
            this.$store.dispatch('setAccounts', val)
            this.$store.dispatch('setTrns', val)
            this.$store.commit('pageLoaded')

            // Save data from firebase to localStorage
            // -----------------------------------------------------------------
            await localforage.setItem('data', {
              user: formatedUser,
              rates: this.$store.state.rates.all,
              accounts: this.$store.state.accounts.all,
              categories: this.$store.state.categories.all
            })
            await localforage.setItem('trns', this.$store.state.trns.all)
          })
        }
        this.$store.commit('closeLoader')
        this.$store.commit('pageLoaded')
      })

      // Add offline trns to firebase when connected
      // -----------------------------------------------------------------------
      let isConnected = false
      const connectionRef = firebase.database().ref('.info/connected')
      connectionRef.on('value', async snap => {
        isConnected = snap.val()
        this.$store.commit('setConnectionStatus', isConnected)
        if (isConnected) {
          const addedOfflineTrns = await localforage.getItem('addedOfflineTrns')
          for (const key in addedOfflineTrns) {
            await this.$store.dispatch('addTrn', addedOfflineTrns[key])
          }

          const updatedOfflineTrns = await localforage.getItem('updatedOfflineTrns')
          for (const key in updatedOfflineTrns) {
            await this.$store.dispatch('updateTrn', updatedOfflineTrns[key])
          }

          const deletedOfflineTrns = await localforage.getItem('deletedOfflineTrns')
          for (const key in deletedOfflineTrns) {
            await this.$store.dispatch('deleteTrn', deletedOfflineTrns[key])
          }
        }
      })
    } catch (error) {
      console.error(error)
      this.$notify({
        group: 'foo',
        title: 'Error',
        text: error.message,
        type: 'error',
        duration: 30000
      })
    }
  },
  store,
  render: h => h(App)
})

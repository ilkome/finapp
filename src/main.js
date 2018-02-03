import firebase from 'firebase'
import moment from 'moment'
import localforage from 'localforage'
import Vue from 'vue'
import VueShortkey from 'vue-shortkey'
import Notifications from 'vue-notification'
import VTooltip from 'v-tooltip'
import velocity from 'velocity-animate'
import { app } from './store/firebase'
import store from './store/store'
import formatDate from './filters/date'
import App from './components/App.vue'
import './service-worker-registration.js'
import formatTrn from '@/store/helpers/formatTrn'

Vue.config.productionTip = false
moment.locale('en')
moment.updateLocale('en', {
  week: {
    dow: 1
  }
})

// filters
Vue.filter('date', formatDate)

// Plugins
Vue.use(VueShortkey)
Vue.use(Notifications, { velocity })
VTooltip.enabled = window.innerWidth > 768
Vue.use(VTooltip)

// init application
new Vue({
  async mounted() {
    try {
      // get localStorage
      // -----------------------------------------------------------------------
      const localData = await localforage.getItem('data')
      const localTrns = await localforage.getItem('trns')
      if (localData) {
        this.$store.commit('signIn', {
          uid: localData.uid
        })
        this.$store.commit('setRates', localData.rates)
        this.$store.commit('setAccounts', localData.accounts)
        this.$store.commit('setCategories', localData.categories)
        this.$store.commit('setTrns', localTrns)
        this.$store.commit('closeLoader')
        this.$store.commit('pageLoaded')
      }

      // get data from DB
      // -----------------------------------------------------------------------
      await app.auth().onAuthStateChanged((user) => {
        if (user) {
          const db = firebase.database()
          let userRef
          if (user.uid === 'yMI5IiF3OrQRgywpZIgXvgrGQyw2' || user.uid === 'x8ChL0AMzGOcCaGP2KsDbMZFZWT2') {
            localStorage.setItem('isShowSystemNotifications', true)
            // const uid = 'x8ChL0AMzGOcCaGP2KsDbMZFZWT2' // Никита
            // const uid = '146kY50VHyaIRKkg5QMIkSK424x1' // Empty
            // const uid = 'kXVGIN19Mhd7WZUeTtZRqUSo2aJ3' // Женя
            // const uid = 'GB5TxVedunVQuNIqBM4vPwndw9N2' // Аня
            const uid = 'yMI5IiF3OrQRgywpZIgXvgrGQyw2' // Илья
            // const uid = 'pMaDbZdHwqXGutbTqFYJMsGwO4z2' // Каза
            // const uid = '8WDRZqvN2AauTXAl4mGwAGyKbbr1' // Сережа
            // const uid = '9nFJjMSSPMfmTtp8mzaPRoxDDq82' // Надя
            userRef = `users/${uid}`
            this.$store.commit('signIn', { uid })
          } else {
            userRef = `users/${user.uid}`
            this.$store.commit('signIn', user)
          }

          db.ref(userRef).once('value')
            .then(async (snapshot) => {
              const data = snapshot.val()
              this.$store.dispatch('setRates')
              this.$store.dispatch('setCategories', data)
              this.$store.dispatch('setAccounts', data)
              this.$store.dispatch('setTrns', data)
              this.$store.commit('pageLoaded')

              // set data to localStorage
              // ---------------------------------------------------------------
              await localforage.setItem('data', {
                uid: user.uid,
                rates: this.$store.state.rates.all,
                accounts: this.$store.state.accounts.all,
                categories: this.$store.state.categories.all,
                trns: this.$store.state.trns.all
              })
              await localforage.setItem('trns', this.$store.state.trns.all)
            })
            .catch(error => {
              console.error(error)
              this.$notify({
                group: 'foo',
                title: 'Error',
                text: error.message,
                type: 'error',
                duration: 30000
              })
            })
        }
        this.$store.commit('closeLoader')
        this.$store.commit('pageLoaded')
      })

      // Offline local trns
      // -----------------------------------------------------------------------
      let isConnected = false
      const connectionRef = firebase.database().ref('.info/connected')
      connectionRef.on('value', async snap => {
        isConnected = snap.val()
        this.$store.commit('setConnectionStatus', isConnected)

        const accounts = this.$store.state.accounts.all
        const categories = this.$store.state.categories.all
        const rates = this.$store.state.rates.all

        // when is back online try to add trns
        let trnsCreatedOffline = await localforage.getItem('trnsCreatedOffline')

        if (this.$store.state.isConnected) {
          if (trnsCreatedOffline && trnsCreatedOffline.length) {
            for (const trnValues of trnsCreatedOffline) {
              const db = firebase.database()
              const formatedValues = {
                accountId: trnValues.accountId,
                amount: trnValues.amount,
                categoryId: trnValues.categoryId,
                date: trnValues.date,
                description: trnValues.description,
                currency: trnValues.currency,
                type: trnValues.type
              }
              this.$store.commit('deleteTrn', trnValues.id)
              await db.ref(`users/${this.$store.state.user.user.uid}/trns`).push(formatedValues)
                .then(async (data) => {
                  const newTrn = {
                    ...formatedValues,
                    id: data.key
                  }

                  const trnAlreadyInStore = this.$store.state.trns.all.find(trn => (trn.id === newTrn.id) || (trn.date === newTrn.date) || (trn.amount === newTrn.amount))
                  if (!trnAlreadyInStore) {
                    const formatedNewTrn = formatTrn(newTrn, { accounts, categories, rates })
                    this.$store.commit('addTrn', formatedNewTrn)
                  }
                  trnsCreatedOffline = trnsCreatedOffline.filter(t => t.date !== newTrn.date)
                  await localforage.setItem('trnsCreatedOffline', trnsCreatedOffline)
                })
                .catch(error => {
                  console.error(error)
                })
            }
          }
        }

        // tell user about online status
        this.$notify({
          group: 'foo',
          title: isConnected ? 'You are online' : 'You are offline',
          type: isConnected ? 'success' : 'info',
          duration: 1000
        })
      })
    } catch (error) {
      // show any errors
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
  el: '.app',
  store,
  render: h => h(App)
})

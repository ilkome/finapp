import firebase from 'firebase'
import moment from 'moment'
import Vue from 'vue'
import VueScrollTo from 'vue-scrollto'
import VueShortkey from 'vue-shortkey'
import Notifications from 'vue-notification'
import VTooltip from 'v-tooltip'
import velocity from 'velocity-animate'
import { app } from './store/firebase'
import store from './store/store'
import formatDate from './filters/date'
import App from './components/App.vue'

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
Vue.use(VueScrollTo)
Vue.use(VueShortkey)
Vue.use(Notifications, { velocity })
VTooltip.enabled = window.innerWidth > 768
Vue.use(VTooltip)

// Init application
new Vue({
  async mounted() {
    const formatDataAndDispatchActions = async (snapshot) => {
      const data = snapshot.val()

      this.$store.dispatch('setRates')
      this.$store.dispatch('setCategories', data)
      this.$store.dispatch('setAccounts', data)
      this.$store.dispatch('setTrns', data)
    }

    try {
      await app.auth().onAuthStateChanged((user) => {
        if (user) {
          const db = firebase.database()
          let userRef

          // Get localStorage
          // const localData = JSON.parse(localStorage.getItem('db'))
          // if (localData) {
          //   this.$store.commit('setRates', localData.rates)
          //   this.$store.commit('setAccounts', localData.accounts)
          //   this.$store.commit('setCategories', localData.categories)
          //   this.$store.commit('setTrns', localData.trns)
          //
          //   this.$store.commit('pageLoaded')
          //   this.$store.commit('closeLoader')
          // }

          if (user.uid === 'yMI5IiF3OrQRgywpZIgXvgrGQyw2' || user.uid === 'x8ChL0AMzGOcCaGP2KsDbMZFZWT2') {
            // const uid = 'x8ChL0AMzGOcCaGP2KsDbMZFZWT2' // Никита
            // const uid = '146kY50VHyaIRKkg5QMIkSK424x1' // Empty
            // const uid = 'kXVGIN19Mhd7WZUeTtZRqUSo2aJ3' // Женя
            // const uid = 'GB5TxVedunVQuNIqBM4vPwndw9N2' // Аня
            const uid = 'yMI5IiF3OrQRgywpZIgXvgrGQyw2' // Илья
            // const uid = 'pMaDbZdHwqXGutbTqFYJMsGwO4z2' // Каза
            // const uid = '8WDRZqvN2AauTXAl4mGwAGyKbbr1' // Сережа
            userRef = `users/${uid}`
            this.$store.commit('signIn', { uid })
          } else {
            userRef = `users/${user.uid}`
            this.$store.commit('signIn', user)
          }

          db.ref(userRef).once('value')
            .then(async (snapshot) => {
              await formatDataAndDispatchActions(snapshot)
              this.$store.commit('pageLoaded')
              this.$store.commit('closeLoader')

              // Set localStorage
              const localData = {
                rates: this.$store.state.rates.all,
                accounts: this.$store.state.accounts.all,
                categories: this.$store.state.categories.all,
                trns: this.$store.state.trns.all
              }
              localStorage.setItem('db', JSON.stringify(localData))
            })
            .catch(error => console.error('main / db', error))
        } else {
          this.$store.commit('closeLoader')
          this.$store.commit('pageLoaded')
        }
      })
    } catch (error) {
      console.error('main / created', error.message)
    }
  },
  el: '.app',
  store,
  render: h => h(App)
})

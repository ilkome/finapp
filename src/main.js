import firebase from 'firebase'
import moment from 'moment'
import Vue from 'vue'
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
Vue.use(VueShortkey)
Vue.use(Notifications, { velocity })
VTooltip.enabled = window.innerWidth > 768
Vue.use(VTooltip)

// Init application
new Vue({
  async mounted() {
    try {
      // Get localStorage
      // const localData = JSON.parse(localStorage.getItem('db'))
      // if (localData) {
      //   this.$store.commit('signIn', localData.user)

      //   this.$store.commit('setRates', localData.rates)
      //   this.$store.commit('setAccounts', localData.accounts)
      //   this.$store.commit('setCategories', localData.categories)
      //   this.$store.commit('setTrns', localData.trns)
      //   this.$store.commit('closeLoader')
      //   this.$store.commit('pageLoaded')
      // }

      // Get date from DB
      await app.auth().onAuthStateChanged((user) => {
        if (user) {
          const db = firebase.database()
          let userRef
          if (user.uid === 'yMI5IiF3OrQRgywpZIgXvgrGQyw2' || user.uid === 'x8ChL0AMzGOcCaGP2KsDbMZFZWT2') {
            // const uid = 'x8ChL0AMzGOcCaGP2KsDbMZFZWT2' // Никита
            // const uid = '146kY50VHyaIRKkg5QMIkSK424x1' // Empty
            // const uid = 'kXVGIN19Mhd7WZUeTtZRqUSo2aJ3' // Женя
            // const uid = 'GB5TxVedunVQuNIqBM4vPwndw9N2' // Аня
            const uid = 'yMI5IiF3OrQRgywpZIgXvgrGQyw2' // Илья
            // const uid = 'pMaDbZdHwqXGutbTqFYJMsGwO4z2' // Каза
            // const uid = '8WDRZqvN2AauTXAl4mGwAGyKbbr1' // Сережа
            // const uid = '9nFJjMSSPMfmTtp8mzaPRoxDDq82' // Надя
            // const uid = 'izPozmQRRIdQaYJC2sKSf7oVyNm2' // Игорь Моргачев
            // const uid = 'k9rJdS5YsNOapaL05akUrnJW96t1' // Катя
            userRef = `users/${uid}`
            this.$store.commit('signIn', { uid })
          } else {
            userRef = `users/${user.uid}`
            this.$store.commit('signIn', user)
          }

          // const userRef = `users/${user.uid}`
          // this.$store.commit('signIn', user)

          db.ref(userRef).once('value')
            .then(async (snapshot) => {
              const data = snapshot.val()
              this.$store.dispatch('setRates')
              this.$store.dispatch('setCategories', data)
              this.$store.dispatch('setAccounts', data)
              this.$store.dispatch('setTrns', data)
              this.$store.commit('pageLoaded')

              // Set localStorage
              const localData = {
                user,
                rates: this.$store.state.rates.all,
                accounts: this.$store.state.accounts.all,
                categories: this.$store.state.categories.all,
                trns: this.$store.state.trns.all
              }

              localStorage.removeItem('db')
              localStorage.setItem('db', JSON.stringify(localData))
              this.$store.commit('closeLoader')
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

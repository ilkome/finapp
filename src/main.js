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
      const localData = JSON.parse(localStorage.getItem('db'))
      if (localData) {
        this.$store.commit('signIn', localData.user)
        this.$store.commit('setRates', localData.rates)
        this.$store.commit('setAccounts', localData.accounts)
        this.$store.commit('setCategories', localData.categories)
        this.$store.commit('setTrns', localData.trns)
        this.$store.commit('closeLoader')
        this.$store.commit('pageLoaded')
      }

      // Get date from DB
      await app.auth().onAuthStateChanged((user) => {
        if (user) {
          const db = firebase.database()
          const userRef = `users/${user.uid}`
          this.$store.commit('signIn', user)

          db.ref(userRef).once('value')
            .then(async (snapshot) => {
              const data = snapshot.val()
              this.$store.dispatch('setRates')
              this.$store.dispatch('setCategories', data)
              this.$store.dispatch('setAccounts', data)
              this.$store.dispatch('setTrns', data)
              this.$store.commit('closeLoader')
              this.$store.commit('pageLoaded')

              this.$notify({
                group: 'foo',
                type: 'success',
                title: 'Updated',
                text: 'Your data was updated from the server'
              })

              // Set localStorage
              const localData = {
                user,
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

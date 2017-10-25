import firebase from 'firebase'
import moment from 'moment'
import Vue from 'vue'
import VueScrollTo from 'vue-scrollto'
import VueShortkey from 'vue-shortkey'
import { app } from './store/firebase'
import store from './store/store'
import formatDate from './filters/date'
import App from './components/App.vue'

Vue.config.productionTip = false
moment.locale('en')

// Filters
Vue.filter('date', formatDate)

// Plugins
Vue.use(VueScrollTo)
Vue.use(VueShortkey)

// Init application
new Vue({
  async mounted() {
    const formatDataAndDispatchActions = async (snapshot) => {
      const data = snapshot.val()

      await this.$store.dispatch('setRates')
      await this.$store.dispatch('setCategories', data)
      await this.$store.dispatch('setAccounts', data)
      await this.$store.dispatch('setTrns', data)

      this.$store.commit('pageLoaded')
      this.$store.commit('closeLoader')
    }

    try {
      await app.auth().onAuthStateChanged((user) => {
        if (user) {
          const db = firebase.database()
          const userRef = `users/${user.uid}`
          this.$store.commit('signIn', user)

          db.ref(userRef).once('value')
            .then(async (snapshot) => {
              await formatDataAndDispatchActions(snapshot)
            })
            .catch(error => console.error(error))
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

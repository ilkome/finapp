import firebase from 'firebase'
import moment from 'moment'
import Vue from 'vue'
import VueRouter from 'vue-router'
import VueScrollTo from 'vue-scrollto'
import VueShortkey from 'vue-shortkey'
import { app } from './store/firebase'
import store from './store/store'
import routes from './routes'
import formatDate from './filters/date'
import isMobile from './utils'
import App from './components/App.vue'

Vue.config.productionTip = false
moment.locale('en')

// Filters
Vue.filter('date', formatDate)

// Plugins
Vue.use(VueScrollTo)
Vue.use(VueRouter)
Vue.use(VueShortkey)

// Router for navigation
const router = new VueRouter({
  routes,
  mode: 'history',
  saveScrollPosition: true,
  linkActiveClass: 'active',
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  if (isMobile) {
    store.commit('toogleLeftbar', 'hide')
    document.querySelector('body').style.overflow = ''
  }
  if (store.state.filter.filter.account && to.path !== '/') {
    store.commit('setAccount', null)
  }
  next()
})

// Init application
new Vue({
  async created() {
    if (isMobile) {
      this.$store.commit('setMobile')
    }

    try {
      await app.auth().onAuthStateChanged((user) => {
        if (user) {
          this.$store.commit('signIn', user)
          const userRef = `users/${user.uid}`

          // const uid = '8WDRZqvN2AauTXAl4mGwAGyKbbr1' // Сережа
          // const uid = 'pMaDbZdHwqXGutbTqFYJMsGwO4z2' // Каза
          // const uid = 'GB5TxVedunVQuNIqBM4vPwndw9N2' // Аня
          // this.$store.commit('signIn', { uid })
          // const userRef = `users/${uid}`

          const formatDataAndDispatchActions = async (snapshot) => {
            const data = snapshot.val()

            await this.$store.dispatch('setRates')
            await this.$store.dispatch('setCategories', data)
            await this.$store.dispatch('setAccounts', data)
            await this.$store.dispatch('setTrns', data)

            this.$store.commit('pageLoaded')
            this.$store.commit('closeLoader')
          }

          const db = firebase.database()
          db.ref(userRef).once('value')
            .then(async (snapshot) => {
              await formatDataAndDispatchActions(snapshot)
            })
            .catch(error => console.error(error))

          // db.ref(userRef).on('value', async (snapshot) => {
          //   await formatDataAndDispatchActions(snapshot)
          // })
        } else {
          this.$store.commit('closeLoader')
          this.$store.commit('pageLoaded')
          this.$router.push('/')
        }
      })
    } catch (error) {
      console.error('main / created', error.message)
    }
  },
  el: '.app',
  store,
  router,
  render: h => h(App)
})

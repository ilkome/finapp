import Vue from 'vue'
import VueRouter from 'vue-router'
import VueScrollTo from 'vue-scrollto'
import moment from 'moment'
import store from './store/store'
import routes from './routes'
import formatDate from './filters/date'
import App from './components/App.vue'

moment.locale('en')

// Filters
Vue.filter('date', formatDate)

// Router
Vue.use(VueRouter)
Vue.use(VueScrollTo)

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

// Init application
/* eslint-disable no-new */
new Vue({
  el: '.app',
  store,
  router,
  render: h => h(App)
})

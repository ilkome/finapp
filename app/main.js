import Vue from 'vue'
import VueRouter from 'vue-router'
import VueScrollTo from 'vue-scrollto'
import vmodal from 'vue-js-modal'
import moment from 'moment'
import store from './store/store'
import routes from './routes'
import formatDate from './filters/date'
import App from './components/App.vue'

Vue.config.productionTip = false
moment.locale('en')

// Filters
Vue.filter('date', formatDate)

// Plugins
Vue.use(VueRouter)
Vue.use(VueScrollTo)
Vue.use(vmodal)

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
new Vue({
  el: '.app',
  store,
  router,
  render: h => h(App)
})
//
// // Add class depends on  is device touch or not
// if (!('ontouchstart' in document.documentElement)) {
//   document.documentElement.className += ' no-touch'
// } else {
//   document.documentElement.className += ' touch'
// }

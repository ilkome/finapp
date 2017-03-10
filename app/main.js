import Vue from 'vue'
import VueRouter from 'vue-router'
import moment from 'moment'
import store from './store/store'
import routes from './routes'
import formatDate from './filters/date'
import App from './App.vue'

moment.locale('ru')

// Filters
Vue.filter('date', formatDate)

// Router
Vue.use(VueRouter)
const router = new VueRouter({
  routes,
  mode: 'history',
  saveScrollPosition: true,
  linkActiveClass: 'active'
})

// Init application
/* eslint-disable no-new */
new Vue({
  el: '.app',
  store,
  router,
  render: h => h(App)
})

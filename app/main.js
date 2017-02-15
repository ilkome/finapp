/* eslint-disable no-new */
import Vue from 'vue'
import VueRouter from 'vue-router'
import { sync } from 'vuex-router-sync'
import moment from 'moment'
import store from './store/store'
import routes from './routes'
import App from './App.vue'

moment.locale('ru')

// Filters
function formatDate(date) {
  const formatedDate = moment(date).format('D.MM.YY')
  const today = moment().format('D.MM.YY')
  const yesterday = moment().subtract(1, 'days').format('D.MM.YY')
  const tomorrow = moment().add(1, 'days').format('D.MM.YY')
  if (formatedDate === today) return 'Сегодня'
  if (formatedDate === yesterday) return 'Вчера'
  if (formatedDate === tomorrow) return 'Завтра'
  return moment(date).format('D.MM.YY')
}
Vue.filter('date', formatDate)

// Router
Vue.use(VueRouter)
const router = new VueRouter({
  routes,
  mode: 'history',
  saveScrollPosition: true,
  linkActiveClass: 'active'
})

// Sync store with router
// sync(store, router)

// Init application
new Vue({
  el: '.app',
  store,
  router,
  render: h => h(App) // JSX
})

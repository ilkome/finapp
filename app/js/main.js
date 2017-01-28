import Vue from 'vue'
import VueRouter from 'vue-router'
import moment from 'moment'
import routes from './routes'
import App from '../vue/App.vue'

moment.locale('ru')

// Router
Vue.use(VueRouter)
const router = new VueRouter({
  routes,
  mode: 'history',
  linkActiveClass: 'active'
})

/* eslint-disable no-new */
// Init application
new Vue({
  router,
  ...App,
}).$mount('.app')


// Same as upper Vue
// BUT reload page than Root updated
// new Vue({
//   el: '.app',
//   router,
//   render: h => h(App) // JSX
// })

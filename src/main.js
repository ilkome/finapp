import moment from 'moment'
import Vue from 'vue'
import VueShortkey from 'vue-shortkey'
import Notifications from 'vue-notification'
import VTooltip from 'v-tooltip'
import velocity from 'velocity-animate'
import store from '@/store/store'
import formatDate from '@/filters/date'
import App from '@/components/App.vue'
if (process.env.NODE_ENV === 'production') {
  require('@/sw.js')
}

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
Vue.use(VTooltip, { enabled: window.innerWidth > 768 })

/* eslint-disable no-new */
new Vue({
  el: '.app',
  store,
  render: h => h(App)
})

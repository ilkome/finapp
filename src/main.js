import Vue from 'vue'
import HighchartsVue from 'highcharts-vue'
import Notifications from 'vue-notification'

import App from '@/components/app/App'
import store from '@/store'

import '@/config'
import '@/registerServiceWorker'

Vue.config.productionTip = false
Vue.config.performance = false

Vue.use(HighchartsVue)
Vue.use(Notifications)

new Vue({
  store,
  render: h => h(App)
}).$mount('.app')

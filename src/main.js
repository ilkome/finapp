import Vue from 'vue'
import HighchartsVue from 'highcharts-vue'
import Notifications from 'vue-notification'
import Lang from 'vue-lang'

import App from '@/components/app/App'
import store from '@/store'

import '@/config'
import '@/registerServiceWorker'

Vue.config.productionTip = false
Vue.config.performance = false

Vue.use(HighchartsVue)
Vue.use(Notifications)

const locales = {
  'en': require('@/lang/en.json'),
  'ru': require('@/lang/ru.json')
}
Vue.use(Lang, { lang: 'en', locales })

new Vue({
  store,
  render: h => h(App)
}).$mount('.app')

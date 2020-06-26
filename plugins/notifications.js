import Vue from 'vue'
import VueNotification from 'vue-notification'

// $notify
if (process.client) {
  Vue.use(VueNotification, {
    componentName: 'Notifications'
  })
}

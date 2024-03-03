import Vue from 'vue'
// import VueNotification from 'vue-notification'

// $notify
export default defineNuxtPlugin(() => {
  if (process.client) {
    // Vue.use(VueNotification, {
    //   componentName: 'Notifications',
    // })
  }
})

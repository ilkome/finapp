import Vue3Toastify, { toast } from 'vue3-toastify'

import BottomSheetClose from '~/components/bottomSheet/BottomSheetClose.vue'

import 'vue3-toastify/dist/index.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Vue3Toastify, {
    autoClose: 500000,
    closeButton: BottomSheetClose,
    hideProgressBar: true,
    icon: false,
    limit: 3,
    multiple: true,
    position: toast.POSITION.TOP_LEFT,
    theme: 'dark',
    transition: 'zoom',
  })

  return {
    provide: { toast },
  }
})

import Vue3Toastify, { type ToastOptions, toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Vue3Toastify, {
    autoClose: 5000,
    limit: 3,
    transition: 'zoom',
    theme: 'auto',
    multiple: true,
    icon: false,
    position: toast.POSITION.TOP_LEFT,
  } as ToastOptions)

  return {
    provide: { toast },
  }
})
